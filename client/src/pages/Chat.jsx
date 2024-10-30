import { useContext, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat, allUsers } = useContext(ChatContext);
  const [refresh, setRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Step 1: Create search query state

  // Step 3: Filter users based on search query
  const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Container>
      <PotentialChats setRefresh={setRefresh} searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> {/* Step 5: Pass search query state and setter */}
      {userChats?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            <div className="chat-list" style={{ position: "relative" }}>
              <div style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
                <input
                  type="text"
                  placeholder="Search conversation"
                  className="form-control mb-3"
                  value={searchQuery} // Step 2: Update search query state on input change
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {isUserChatsLoading && <p>Loading chats...</p>}
              {userChats?.map((chat, index) => {
                const recipientId = chat.members.find(id => id !== user._id);
                const recipientExists = filteredUsers.some(u => u._id === recipientId); // Step 4: Use filtered users array

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