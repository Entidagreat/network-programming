import { useContext, useState, useEffect, useRef } from "react";
import { GroupContext } from "../../context/GroupContext";
import { AuthContext } from "../../context/AuthContext";
import { Stack } from "react-bootstrap";
import InputEmoji from "react-input-emoji";

const GroupChat = () => {
    const { currentGroup, groupMessages, isGroupMessagesLoading, sendGroupMessage } = useContext(GroupContext);
    const { user } = useContext(AuthContext);
    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef();

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [groupMessages]);

    const handleSendMessage = () => {
        if (textMessage.trim()) {
            sendGroupMessage(currentGroup._id, user._id, textMessage);
            setTextMessage("");
        }
    };

    if (!currentGroup) {
        return <p style={{ textAlign: "center", width: "100%" }}>Select a group to start chatting...</p>;
    }

    return (
        <Stack gap={4} className="group-chat">
            <div className="chat-header">
                <strong>{currentGroup.name}</strong>
            </div>
            <Stack gap={3} className="messages">
                {isGroupMessagesLoading ? (
                    <p style={{ textAlign: "center", width: "100%" }}>Loading messages...</p>
                ) : (
                    groupMessages.map((message, index) => (
                        <div key={index} className={`message ${message.senderId === user._id ? "self" : ""}`}>
                            <span>{message.text}</span>
                        </div>
                    ))
                )}
                <div ref={scroll}></div>
            </Stack>
            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
                <InputEmoji value={textMessage} onChange={setTextMessage} />
                <button className="send-btn" onClick={handleSendMessage}>
                    Send
                </button>
            </Stack>
        </Stack>
    );
};

export default GroupChat;