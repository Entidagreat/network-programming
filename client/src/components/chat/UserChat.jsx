import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import avartar from "../../assets/avartar.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchMessage";
import moment from "moment";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../utils/translations";

const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationsAsRead } =
        useContext(ChatContext);
    const { latestMessage } = useFetchLatestMessage(chat);
    const { language } = useLanguage();
    const t = translations[language];


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
    // console.log("URL avatar:", recipientUser?.avatar); 

    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="user-card align-items-center p-2 justify-context-between"
            style={{ minWidth: "250px" }}
            role="button"
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationsAsRead(thisUserNotifications, notifications);
                }
            }}
        >
            
           <div className="d-flex position-relative">
           <div className="me-2 ">
           <img 
                src={recipientUser?.avatar || avartar} 
                height="35px"
                width="35px"
                style={{ borderRadius: "50%" }}
                alt={recipientUser?.name || "Người dùng"} 
                onError={(e) => { e.target.onerror = null; e.target.src = avartar }} 
                />
                <span 
                className={isOnline ? "user-online" : ""} 
                style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "11px",
                    height: "11px",
                    borderRadius: "50%",
                    backgroundColor: isOnline ? "#44b700" : "#ccc",
                    border: "1.5px solid white",
                    marginRight: "215px",
                    // marginRight: "175px",

                }}
                    ></span>
                </div>
                <div className="text-content" style={{ maxHeight: "33px",marginBottom:"5px" }}>
                    <div className="name" style={{ maxWidth:"450px"}}>{recipientUser?.name}</div>
                    <div className="text" style={{}}>
                        {latestMessage?.text && (
                            <span>{truncateText(latestMessage?.text)}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex flex-colum align-items-end" style={{}}>
            <div className="date" style={{}}>
                    {moment(latestMessage?.createdAt).calendar(null, {
                        sameDay: 'HH:mm',
                        lastDay: `[${t.datetime.yesterday}]`,
                        lastWeek: '[Last] dddd',
                        sameElse: function(now) {
                        const days = moment(now).diff(moment(latestMessage?.createdAt), 'days');
                        // if (days <= 7) return '[' + days + ' days ago]';
                        // if (days <= 30) return '[1 month ago]';
                        if (days < 7) return `[${days} ${t.datetime.day}]`;
                        if (days <= 30) return `[${t.datetime.month}]`;
                        return 'YYYY-MM-DD';
                        }
                    })}
                    </div>
                <div
                    className={
                        thisUserNotifications?.length > 0 ? "this-user-notifications" : ""
                    }
                >
                    {thisUserNotifications?.length > 0
                        ? thisUserNotifications?.length
                        : ""}
                </div>
                {/* <span className={isOnline ? "user-online" : ""}></span> */}
            </div>
        </Stack>
    );
};

export default UserChat;