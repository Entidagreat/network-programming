import { useContext, useCallback, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../utils/translations";
import { baseUrl, getRequest } from "../../utils/services";
import { useFetchLatestMessage } from "../../hooks/useFetchMessage";

const PotentialChats = ({ setRefresh }) => {
  const { user } = useContext(AuthContext);
  const {
    potentialChats,
    createChat,
    onlineUsers,
    setPotentialChats,
    updateUserChats,
    updateCurrentChat,
    latestGroupMessage,
  } = useContext(ChatContext);
  const { language } = useLanguage();
  const t = translations[language];
  const [groups, setGroups] = useState([]);

  const deleteUser = useCallback(async (userId) => {
    try {
      await axios.delete(`${baseUrl}/users/${userId}`);
      const updatedPotentialChats = potentialChats.filter(
        (u) => u._id !== userId
      );
      setPotentialChats(updatedPotentialChats);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }, [potentialChats, setPotentialChats]);

  const truncateText = (text) => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };

  const uniqueGroups = useMemo(() => {
    if (!groups) return [];
    // Filter out duplicates by group ID
    return Array.from(new Map(groups.map(group => [group._id, group])).values());
  }, [groups]);

  useEffect(() => {
    const addUsersToChatList = async () => {
      try {
        for (const potentialUser of potentialChats) {
          await createChat(user._id, potentialUser._id);
        }
      } catch (error) {
        console.error("Error adding users to chat list:", error);
      }
    };

    if (user?._id) {
      addUsersToChatList();
    }
  }, [potentialChats, createChat, user]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const res = await getRequest(`${baseUrl}/groups/user/${user._id}`);
        if (!res.error) {
          console.log('Fetched groups:', res);
          setGroups(res);
        } else {
          console.error("Error fetching user groups:", res.message);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    if (user?._id) {
      fetchUserGroups();
    }
  }, [user]);

  // Fetch user details 
  const fetchUser = async (userId) => {
    try {
      console.log("Fetching user with ID:", userId);
      const res = await getRequest(`${baseUrl}/users/find/${userId}`);
      if (!res.error) {
        console.log("User data:", res);
        return res;
      } else {
        console.error("Error fetching user:", res.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Fetch group messages
  // Fetch group messages
  // PotentialChats.jsx
  const handleGroupClick = async (group) => {
    try {
      if (!group?._id) {
        console.error("Invalid group object");
        return;
      }

      const groupId = group._id;
      const messages = await fetchGroup(groupId);

      // Format members correctly
      const memberIds = group.members?.map(member => {
        // Handle different member object structures
        const userId = member?.user?._id || member?._id;
        if (!userId) {
          console.warn("Invalid member object:", member);
        }
        return userId;
      }).filter(id => id); // Remove any undefined/null values

      // Create properly formatted group object
      const formattedGroup = {
        ...group,
        messages: messages || [],
        members: memberIds,
        isGroup: true
      };

      // Update chat context with formatted group
      updateCurrentChat(formattedGroup);

    } catch (error) {
      console.error("Error in handleGroupClick:", error);
      // Optional: Add user notification here
      // toast.error("Failed to load group chat");
    }
  };

  // Helper function to fetch group messages
  const fetchGroup = async (groupId) => {
    try {
      if (!groupId) throw new Error("Group ID is required");

      const response = await getRequest(`${baseUrl}/groups/messages/${groupId}`);
      if (response.error) throw new Error(response.message);

      return response;
    } catch (error) {
      console.error("Error fetching group messages:", error);
      return null;
    }
  };
  return (
    <div className="potential-chats">
      {Array.isArray(uniqueGroups) && uniqueGroups.map((group) => (
       <div
       key={group._id}
       className="user-card align-items-center p-2 justify-content-between hstack gap-3"
       onClick={() => handleGroupClick(group)}
     >
       <div className="user-info d-flex align-items-center gap-3">
         <div className="d-flex flex-column">
           <span className="group-name fw-bold">{group.name}</span>
           <div className="text">
             {latestGroupMessage?.text && (
               <span>{truncateText(latestGroupMessage.text)}</span>
             )}
           </div>
         </div>
       </div>
       {onlineUsers?.some((user) =>
         group.members.some((m) => m.user && m.user._id === user.userId)
       ) && (
         <span className="online-dot"></span>
       )}
     </div>
      ))}
    </div>
  );
};

export default PotentialChats;