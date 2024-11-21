import { useState, useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import moment from "moment";
import "moment/locale/vi";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../utils/translations";

const Notification = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const { notifications, userChats, allUsers, markAllNotificationsAsRead, markAllNotificationAsRead } =useContext(ChatContext);

        const chatContext = useContext(ChatContext);
    
        if (!chatContext) {
            console.error("ChatContext is undefined. Ensure that Notification is wrapped with ChatContext.Provider.");
            return null;
        }
    const unreadNotifications = unreadNotificationsFunc(notifications);

    const { language } = useLanguage();
    const t = translations[language]; // Sử dụng translations từ utils/translations

    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find(user => user._id === n.senderId);
        const group = userChats.find(chat => chat._id === n.groupId);

        return {
            ...n,
            senderName: sender?.name || group?.name || 'Unknown',
        }

    })
    // console.log("un", unreadNotifications);
    // console.log("mn", modifiedNotifications);

    if (language === 'vn') {
        moment.locale('vi');
    } else {
        moment.locale('en');
    }


    return (
        <div className="notifications">
            <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-chat"
                    viewBox="0 0 16 16"
                >
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                </svg>
                {unreadNotifications?.length === 0 ? null : (
                    <span className="notification-count">
                        <span>{unreadNotifications?.length}</span>
                    </span>
                )}

            </div>
            {isOpen ? (
                <div className="notifications-box">
                    <div className="notifications-header">
                        <h3>{t.Notification.Tag}</h3>
                        <div
                            className="mark-as-read"
                            onClick={() => markAllNotificationsAsRead(notifications)}
                        >
                            {t.Notification.mark}
                        </div>
                    </div>
                    {modifiedNotifications?.length === 0 ? <span className="notification">{t.Notification.noNotification}</span> : null}
                    {modifiedNotifications && modifiedNotifications.map((n, index) => {
                        return (
                            <div key={index}
                                className={
                                    n.isRead ? 'notification' : 'notification not-read'
                                }
                                onClick={() => {
                                    markAllNotificationAsRead(n, userChats, user, notifications);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{n.type === 'group' ? `${n.senderName} sent a message in group ${n.groupId}` : ''}</span>
                                <span>{n.type !== 'group' ? `${n.senderName} sent you a new message` : ''}</span>
                                <span className="notification-time">
                                    {moment(n.date).calendar()}
                                </span>

                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};

export default Notification;