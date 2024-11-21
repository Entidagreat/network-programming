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

    // Socket Connection
    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Online Users Management
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

    // Notification Handler with Callback
const handleNotification = useCallback((res) => {
    console.log('Received notification:', res);
  
    // Ensure res has the necessary properties 
    if (!res || !res.senderId) {  // Removed messageId check
      console.error('Invalid notification format:', res);
      return;
    }
  
    const isGroupMessage = res.type === 'group' || Boolean(res.groupId); 
    let isChatOpen = false;
  
    if (isGroupMessage) {
      isChatOpen = currentChat?._id === res.groupId; 
    } else {
      isChatOpen = currentChat?.members?.some(id => id === res.senderId); 
    }
  
    setNotifications(prev => {
      //  Loại bỏ kiểm tra trùng lặp bằng messageId
  
      return isChatOpen 
        ? [{ ...res, isRead: true }, ...prev] 
        : [res, ...prev];
    });
  }, [currentChat]);
const handleNotificationClick = (notification) => {
    if (notification.groupId) {
        // Redirect to sender's personal chat instead of group
        const personalChat = userChats.find(chat => chat.members.includes(notification.senderId));
        if (personalChat) {
            updateCurrentChat(personalChat);
        } else {
            console.warn('Personal chat not found for sender:', notification.senderId);
        }
    } else {
        const chat = userChats.find(chat => chat._id === notification.chatId);
        if (chat) {
            updateCurrentChat(chat);
        } else {
            console.warn('Chat not found for notification:', notification.chatId);
        }
    }
};
    // Notification Socket Listener
    useEffect(() => {
        if (socket === null) return;
        socket.on('getNotification', handleNotification);

        return () => {
            socket.off('getNotification', handleNotification);
        };
    }, [socket, handleNotification]);

    // Message Handling for Group and Personal Chats
    useEffect(() => {
    if (currentChat && currentChat.isGroup) {
        const groupId = currentChat._id;
        socket.emit('joinGroup', groupId);
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

    const handleNewFile = (res) => {
        if (currentChat?._id !== res.chatId) return;
        setMessages(prev => {
            // Tìm vị trí của tin nhắn file trong mảng messages
            const index = prev.findIndex(m => m._id === res._id);
            if (index === -1) {
                // Nếu không tìm thấy, thêm tin nhắn mới vào đầu mảng
                return [res, ...prev];
            } else {
                // Nếu tìm thấy, cập nhật tin nhắn file
                const updatedMessages = [...prev];
                updatedMessages[index] = res;
                return updatedMessages;
            }
        });
    };


    socket.on("getMessage", handleNewMessage);
    socket.on("getGroupMessage", handleNewGroupMessage);
    socket.on("newFile", handleNewFile); // Lắng nghe sự kiện newFile

    return () => {
        socket.off("getMessage", handleNewMessage);
        socket.off("getGroupMessage", handleNewGroupMessage);
        socket.off("newFile", handleNewFile); // Hủy lắng nghe sự kiện newFile
    };
}, [socket, currentChat]);

    // Users and Chats Fetching
    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users", response);
            }

            const pChats = response?.filter((u) => {
                if (user?._id === u._id) return false;

                return userChats 
                    ? !userChats.some((chat) => 
                        chat.members[0] === u._id || chat.members[1] === u._id
                    )
                    : true;
            });

            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats]);

    // ... other code ...

useEffect(() => {
    const getUserChats = async () => {
        if (user?._id) {
            setIsUserChatsLoading(true);
            setUserChatsError(null);
    
            try {
                // Fetch user's one-on-one chats and groups
                const [chatsResponse, groupsResponse] = await Promise.all([
                    getRequest(`${baseUrl}/chats/${user?._id}`),
                    getRequest(`${baseUrl}/groups/user/${user?._id}`)
                ]);
    
                if (chatsResponse.error) {
                    throw new Error(chatsResponse.message);
                }
    
                if (groupsResponse.error) {
                    throw new Error(groupsResponse.message);
                }
    
                // Combine chats and groups
                const allChats = [...chatsResponse, ...groupsResponse.map(group => ({
                    ...group,
                    isGroup: true, // Ensure group flag is set
                    name: group.name // Ensure group name is included
                }))];
    
                setUserChats(allChats);
            } catch (error) {
                setUserChatsError(error.message);
            } finally {
                setIsUserChatsLoading(false);
            }
        }
    };

  getUserChats();
}, [user, notifications]); // Re-fetch when user or notifications change

// ... other code ...

    // Messages Fetching
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

    // File Sending Function
    // Trong component ChatContextProvider
// Trong component ChatContextProvider
const sendFile = (file) => {
    if (socket) {
        console.log("Bắt đầu gửi file:", file); // Log trước khi gửi

        socket.emit('sendFile', {
            chatId: currentChat._id,
            senderId: user._id,
            recipientId: currentChat.isGroup ? null : currentChat.members.find(id => id !== user._id),
            groupId: currentChat.isGroup ? currentChat._id : null,
            file: file
        }, (response) => {
            if (response.status === "sent") {
                console.log("File sent successfully");
            } else {
                console.error("File sending error:", response.error);
            }
        });
    } else {
        console.error("Socket.IO not initialized.");
    }
};
    // Text Message Sending with Socket Emission
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

    // Chat and Notification Management Functions
    const updateCurrentChat = useCallback((chat) => {
    if (chat) {
        setCurrentChat(chat);
    } else {
        console.error('Attempted to set a null or undefined chat.');
    }
}, []);
    const createChat = useCallback(async (firstId, secondId, isGroupChat = false, groupName = '') => {
        let endpoint = `${baseUrl}/chats`;
        let requestBody;

        if (isGroupChat) {
            const members = Array.isArray(secondId) ? secondId : [secondId];

            endpoint = `${baseUrl}/groups`;
            requestBody = {
                name: groupName,
                members: members.map(member => ({ user: member, role: 'member' })),
            };
        } else {
            requestBody = {
                firstId,
                secondId,
            };
        }

        const response = await postRequest(endpoint, JSON.stringify(requestBody));

        if (response.error) {
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => Array.isArray(prev) ? [...prev, response] : [response]);
    }, []);

    // Mark All Notifications as Read
    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotification = notifications.map((n) => ({
            ...n, 
            isRead: true 
        }));

        setNotifications(mNotification);
    }, []);

    // Mark Specific Notification as Read
   const markAllNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      if (!n || !userChats || !user || !notifications) { 
        console.error('Invalid input to markAllNotificationAsRead');
        return;
      }
  
      const desiredChat = userChats.find((chat) => {
        if (n.groupId) { // Check if it's a group notification
          return chat._id === n.groupId;
        } else {
          const chatMembers = [user._id, n.senderId];
          return chat?.members.every(member => chatMembers.includes(member));
        }
      });
  
      if (!desiredChat) {
        console.warn('Chat not found for notification:', n);
        return;
      }
  
      const mNotifications = notifications.map((el) =>
        n._id === el._id  // Use _id for comparison
          ? { ...n, isRead: true }
          : el
      );
  
      updateCurrentChat(desiredChat);
      setNotifications(mNotifications);
    },
    []
  );

    // Update User Chats
    const updateUserChats = useCallback(async () => {
        if (user?._id) {
            const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
            if (response.error) {
                return setUserChatsError(response.message);
            }
            setUserChats(response);
        }
    }, [user?._id]);

    // Mark User-Specific Notifications as Read
    const markThisUserNotificationsAsRead = useCallback(
        (thisUserNotifications, notifications) => {
            const mNotifications = notifications.map((el) => {
                const matchingNotification = thisUserNotifications.find(
                    n => n.senderId === el.senderId
                );
                return matchingNotification 
                    ? { ...matchingNotification, isRead: true } 
                    : el;
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
                sendFile,
handleNotificationClick,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};