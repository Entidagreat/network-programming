import React from 'react';
import { Stack } from 'react-bootstrap';
import moment from 'moment';
import defaultGroupImage from '../assets/default-group-image.png';
import avartar from '../assets/avartar.svg';

const GroupChat = ({ 
  group, 
  latestGroupMessage, 
  thisGroupNotifications, 
  notifications,
  markThisGroupNotificationsAsRead,
  isGroupOnline 
}) => {
  const truncateText = (text) => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };

  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="group-card align-items-center p-2 justify-context-between"
      role="button"
      onClick={() => {
        if (thisGroupNotifications?.length !== 0) {
          markThisGroupNotificationsAsRead(thisGroupNotifications, notifications);
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
          <img
            src={group?.avatar || avartar}
            height="35px"
            width="35px"
            style={{ borderRadius: "50%" }}
            alt={group?.name || "Group"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultGroupImage;
            }}
          />
        </div>
        <div className="text-content">
          <div className="name">{group?.name}</div>
          <div className="text">
            {latestGroupMessage?.text && (
              <span>{truncateText(latestGroupMessage?.text)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">
          {moment(latestGroupMessage?.createdAt).calendar()}
        </div>
        <div
          className={
            thisGroupNotifications?.length > 0 ? "this-group-notifications" : ""
          }
        >
          {thisGroupNotifications?.length > 0 ? thisGroupNotifications?.length : ""}
        </div>
        <span className={isGroupOnline ? "group-online" : ""}></span>
      </div>
    </Stack>
  );
};

export default GroupChat;