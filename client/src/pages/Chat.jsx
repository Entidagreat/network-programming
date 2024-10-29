import { useContext, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";


const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat, allUsers } = useContext(ChatContext); // Lấy allUsers từ context
    const [refresh, setRefresh] = useState(false);

    return (
        <Container>
            <PotentialChats setRefresh={setRefresh} />
            {userChats?.length < 1 ? null : (
                <Stack direction="horizontal" gap={4} className="align-items-start">
                    <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
                        {isUserChatsLoading && <p>Loading chats...</p>}
                        {userChats?.map((chat, index) => {
                            // Kiểm tra xem người nhận có tồn tại trong allUsers hay không
                            const recipientId = chat.members.find(id => id !== user._id);
                            const recipientExists = allUsers.some(u => u._id === recipientId);

                            // Chỉ render UserChat nếu người nhận tồn tại
                            return recipientExists ? (
                                <div key={index} onClick={() => updateCurrentChat(chat)}>
                                    <UserChat chat={chat} user={user} />
                                </div>
                            ) : null;
                        })}
                    </Stack>
                    <ChatBox />
                </Stack>
            )}
        </Container>
    );
};

export default Chat;