import { useContext, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../utils/translations";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat, allUsers } =
    useContext(ChatContext);
  const [refresh, setRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = translations[language];

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
      <Stack direction="horizontal" gap={4} className="align-items-start">
        <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            {<div
              style={{
                position: "relative",
                top: 30,
                zIndex: 1,
              }}
            >
              <input
                type="text"
                placeholder={t.chat.searchPlaceholder}
                className="form-control mb-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>}
          <div className="chat-list" style={{ position: "relative" }}>
            <PotentialChats
              setRefresh={setRefresh}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            {isUserChatsLoading && <p> {t.chat.loading} </p>}
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
        {filteredChatList?.length > 0 && <ChatBox />} {/* Only render ChatBox if there are chats */}
      </Stack>
    </Container>
  );
};

export default Chat;