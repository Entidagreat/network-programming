import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import avartar from "../../assets/avartar.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationsAsRead } =
        useContext(ChatContext);
    const { latestMessage } = useFetchLatestMessage(chat);


    const unreadNotifications = unreadNotificationsFunc(notifications);
    const thisUserNotifications = unreadNotifications?.filter(
        (n) => n.senderId === recipientUser?._id
    );
    const isOnline = onlineUsers?.some(
        (user) => user?.userId === recipientUser?._id
    );

    const truncateText = (text) => {
        let shortText = text.substring(0, 20);

        if (text.length > 20) {
            shortText += "...";
        }

        return shortText;
    }
    console.log("URL avatar:", recipientUser?.avatar); 

    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="user-card align-items-center p-2 justify-context-between"
            role="button"
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationsAsRead(thisUserNotifications, notifications);
                }
            }}
        >
           <div className="d-flex">
           <div className="me-2">
           <img 
  src={recipientUser?.avatar || avartar} 
  height="35px" 
  alt={recipientUser?.name || "Người dùng"} 
  onError={(e) => { e.target.onerror = null; e.target.src = avartar }} 
/>
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">
                        {latestMessage?.text && (
                            <span>{truncateText(latestMessage?.text)}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex flex-colum align-items-end">
                <div className="date">{moment(latestMessage?.createdAt).calendar()}</div>
                <div
                    className={
                        thisUserNotifications?.length > 0 ? "this-user-notifications" : ""
                    }
                >
                    {thisUserNotifications?.length > 0
                        ? thisUserNotifications?.length
                        : ""}
                </div>
                <span className={isOnline ? "user-online" : ""}></span>
            </div>
        </Stack>
    );
};

export default UserChat;