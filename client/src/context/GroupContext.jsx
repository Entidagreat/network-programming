import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";

export const GroupContext = createContext();

export const GroupContextProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const [isGroupMessagesLoading, setIsGroupMessagesLoading] = useState(false);
    const [groupMessagesError, setGroupMessagesError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            const response = await getRequest(`${baseUrl}/groups`);
            if (!response.error) {
                setGroups(response);
            }
        };
        fetchGroups();
    }, []);

    const fetchGroupMessages = useCallback(async (groupId) => {
        setIsGroupMessagesLoading(true);
        const response = await getRequest(`${baseUrl}/groups/${groupId}/messages`);
        setIsGroupMessagesLoading(false);
        if (!response.error) {
            setGroupMessages(response);
        } else {
            setGroupMessagesError(response.message);
        }
    }, []);

    const sendGroupMessage = useCallback(async (groupId, senderId, text) => {
        const response = await postRequest(`${baseUrl}/groups/sendMessage`, {
            groupId,
            senderId,
            text,
        });
        if (!response.error) {
            setGroupMessages((prev) => [...prev, response]);
        }
    }, []);

    return (
        <GroupContext.Provider
            value={{
                groups,
                currentGroup,
                setCurrentGroup,
                groupMessages,
                isGroupMessagesLoading,
                groupMessagesError,
                fetchGroupMessages,
                sendGroupMessage,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
};