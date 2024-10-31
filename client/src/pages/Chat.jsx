import { useContext, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";
import { GroupContextProvider } from "../context/GroupContext";
import GroupList from "../components/chat/GroupList";
import GroupChat from "../components/chat/GroupChat";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat, allUsers } =
    useContext(ChatContext);
  const [refresh, setRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc danh sách chat để loại bỏ các chat trùng lặp
  const filteredChatList = userChats?.reduce((acc, current) => {
    const existingChat = acc.find((chat) =>
      chat.members.every((member) => current.members.includes(member))
    );
    if (!existingChat) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Lọc danh sách user dựa trên searchQuery
  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <PotentialChats
        setRefresh={setRefresh}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {filteredChatList?.length < 1 ? null : ( 
        // Sử dụng filteredChatList thay vì userChats
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            <div className="chat-list" style={{ position: "relative" }}>
              {<div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "white",
                }}
              >
                <input
                  type="text"
                  placeholder="Search conversation"
                  className="form-control mb-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>}
              {isUserChatsLoading && <p>Loading chats...</p>}
              {filteredChatList?.map((chat) => { 
                // Sử dụng filteredChatList thay vì userChats
                const recipientId = chat.members.find((id) => id !== user._id);
                const recipientExists = filteredUsers.some(
                  (u) => u._id === recipientId
                );

                return recipientExists ? (
                  <div key={chat._id} onClick={() => updateCurrentChat(chat)}>
                    <UserChat chat={chat} user={user} />
                  </div>
                ) : null;
              })}
            </div>
          </Stack>
          <ChatBox />
          
        </Stack>
      )}
    </Container>
  );
};

export default Chat;