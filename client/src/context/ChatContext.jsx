import { useCallback } from "react";
import { createContext, useState, useEffect } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // console.log("onlineUsers", onlineUsers);
    // console.log("notifications", notifications);

    //CLIENT SIDE SOCKET
    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });
        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket]);
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (res) => {
            console.log('Received notification:', res);
            const isGroupMessage = Boolean(res.groupId);
            const isChatOpen = isGroupMessage
                ? currentChat?._id === res.groupId // For group messages
                : currentChat?.members?.some(id => id === res.senderId); // For 1-on-1 messages
            setNotifications(prev => {
                const isDuplicate = prev.some(n => n._id === res._id);
                if (isDuplicate) {
                    return prev;
                }

                if (isChatOpen) {
                    return [{ ...res, isRead: true }, ...prev];
                } else {
                    return [res, ...prev];
                }
            });
        };
        socket.on('getNotification', handleNotification);

        return () => {
            socket.off('getNotification', handleNotification);
        };
    }, [socket, currentChat]);

    //send message
    useEffect(() => {
        if (currentChat && currentChat.isGroup) {
            const groupId = currentChat._id;
            console.log('Chuẩn bị tham gia nhóm:', groupId);
            socket.emit('joinGroup', groupId);
            console.log('Đã gửi yêu cầu tham gia nhóm:', groupId);
        }
        if (socket === null) return;

        const handleNewMessage = (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => Array.isArray(prev) ? [...prev, res] : [res]);
        };

        const handleNewGroupMessage = (res) => {
            if (currentChat?._id !== res.groupId) return;
            setMessages((prev) => Array.isArray(prev) ? [...prev, res] : [res]);
        };

        const handleNotification = (res) => {
            const isGroupMessage = Boolean(res.groupId);
            const isChatOpen = isGroupMessage
                ? currentChat?._id === res.groupId // For group messages
                : currentChat?.members?.some(id => id === res.senderId); // For 1-on-1 messages
            if (isChatOpen) {
                setNotifications(prev => Array.isArray(prev) ?
                    [{ ...res, isRead: true }, ...prev] : [{ ...res, isRead: true }]);
            } else {
                setNotifications(prev => Array.isArray(prev) ? [res, ...prev] : [res]);
            }
        };

        socket.on("getMessage", handleNewMessage);
        socket.on("getGroupMessage", handleNewGroupMessage);
        socket.on("getNotification", handleNotification);

        return () => {
            socket.off("getMessage", handleNewMessage);
            socket.off("getGroupMessage", handleNewGroupMessage);
            socket.off("getNotification", handleNotification);
        };
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users", response);
            }

            const pChats = response?.filter((u) => {
                let isChatCreated = false;

                if (user?._id === u._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    });
                }

                return !isChatCreated;
            });

            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if (response.error) {
                    setUserChatsError(response.message);
                }

                setUserChats(response);
            }

        };
        getUserChats();

    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(
                `${baseUrl}/messages/${currentChat?._id}`
            );

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessagesError(response);
            }

            setMessages(response);
        };

        getMessages();
    }, [currentChat]);

    useEffect(() => {
        if (socket === null) return;
        socket.on("getMessage", (message) => {
            // Xử lý tin nhắn nhận được
            console.log("Received message:", message);
            // Cập nhật giao diện người dùng với tin nhắn mới
        });

        socket.on("getGroupMessage", (message) => {
            // Xử lý tin nhắn nhóm nhận được
            console.log("Received group message:", message);
            // Cập nhật giao diện người dùng với tin nhắn nhóm mới
        });

        return () => {
            socket.off("getMessage");
            socket.off("getGroupMessage");
        };
    }, [socket]);

    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) return console.log("You must type a message");

            const isGroupChat = currentChat?.isGroup;
            const endpoint = `${baseUrl}/messages`;

            const messageData = {
                chatId: currentChatId,
                senderId: sender._id,
                text: textMessage,
                isGroupMessage: isGroupChat
            };

            try {
                const response = await postRequest(endpoint, JSON.stringify(messageData));

                if (response.error) {
                    setSendTextMessageError(response);
                    return;
                }

                setNewMessage(response);
                setMessages((prev) => Array.isArray(prev) ? [...prev, response] : [response]);
                setTextMessage("");

                // Emit socket event based on chat type
                if (isGroupChat) {
                    socket?.emit("sendGroupMessage", {
                        ...response,
                        groupId: currentChatId,
                    });
                } else {
                    const recipientId = currentChat.members.find(id => id !== sender._id);
                    socket?.emit("sendMessage", {
                        ...response,
                        recipientId,
                    });
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setSendTextMessageError(error);
            }
        },
        [currentChat, socket]
    );

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId, isGroupChat = false, groupName = '') => {
        // console.log("createChat called with:", { firstId, secondId, isGroupChat, groupName });

        let endpoint = `${baseUrl}/chats`;
        let requestBody;

        if (isGroupChat) {
            const members = Array.isArray(secondId) ? secondId : [secondId];

            endpoint = `${baseUrl}/groups`;
            requestBody = {
                name: groupName,
                members: members.map(member => ({ user: member, role: 'member' })),
            };

            console.log("Creating a group chat with the following details:", requestBody);
        } else {
            requestBody = {
                firstId,
                secondId,
            };

            // console.log("Creating a personal chat with the following details:", requestBody);
        }

        const response = await postRequest(endpoint, JSON.stringify(requestBody));

        if (response.error) {
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => Array.isArray(prev) ? [...prev, response] : [response]);
    }, []);

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotification = notifications.map((n) => {
            return { ...n, isRead: true };
        });

        setNotifications(mNotification);

    }, []);

    const markAllNotificationAsRead = useCallback(
        (n, userChats, user, notifications) => {
            //find chat to open

            const desiredChat = userChats.find((chat) => {
                const chatMembers = [user._id, n.senderId];
                const isDesiredChat = chat?.members.every((member) => {
                    return chatMembers.includes(member);
                });

                return isDesiredChat;
            });
            // mark notification as read
            const mNotifications = notifications.map((el) => {
                if (n.senderId === el.senderId) {
                    return { ...n, isRead: true };
                } else {
                    return el;
                }

            });

            updateCurrentChat(desiredChat);
            setNotifications(mNotifications);
        },
        []
    );

    const updateUserChats = useCallback(async () => {
        if (user?._id) {
            const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
            if (response.error) {
                return setUserChatsError(response.message);
            }
            setUserChats(response);
        }
    }, [user?._id]); // Chỉ re-create hàm khi user._id thay đổi

    const markThisUserNotificationsAsRead = useCallback(
        (thisUserNotifications, notifications) => {
            //mark notifications as read

            const mNotifications = notifications.map((el) => {
                let notification;

                thisUserNotifications.forEach((n) => {
                    if (n.senderId === el.senderId) {
                        notification = { ...n, isRead: true };
                    } else {
                        notification = el;
                    }
                });
                return notification;
            });
            setNotifications(mNotifications);
        },
        []
    );

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                potentialChats,
                createChat,
                updateCurrentChat,
                messages,
                isMessagesLoading,
                messagesError,
                currentChat,
                sendTextMessage,
                onlineUsers,
                notifications,
                allUsers,
                sendTextMessageError,
                markAllNotificationsAsRead,
                markAllNotificationAsRead,
                markThisUserNotificationsAsRead,
                updateUserChats,

            }}
        >
            {children}
        </ChatContext.Provider>
    );
};