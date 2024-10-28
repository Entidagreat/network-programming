import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import { translateText } from "../../utils/translate"; 
import he from "he";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, user);
  const [textMessage, setTextMessage] = useState("");
  const [translations, setTranslations] = useState({}); 
  const scroll = useRef();

  // Xóa bản dịch khi chuyển đổi cuộc hội thoại
  useEffect(() => {
    setTranslations({});
  }, [currentChat]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendTextMessage(textMessage, user, currentChat._id, setTextMessage);
    }
  };

  // Trong hàm handleTranslate:
  const handleTranslate = async (message) => {
      try {
          const translatedText = await translateText(message.text, 'en'); 
          const decodedText = he.decode(translatedText); // Giải mã nội dung
          setTranslations(prev => ({ ...prev, [message._id]: decodedText })); 
      } catch (error) {
          console.error("Error translating message:", error);
      }
  };
  

  if (!user) {
    return <p style={{ textAlign: "center", width: "100%" }}>Loading user...</p>;
  }

  if (!recipientUser) {
    return (
      <p style={{ textAlign: "center", width: "100%" }}>
        No conversation selected yet...
      </p>
    );
  }

  if (isMessagesLoading) {
    return <p style={{ textAlign: "center", width: "100%" }}>Loading Chat...</p>;
  }

  return (
    <Stack gap={4} className="chat-box">
      <div className="chat-header">
        <strong>{recipientUser?.name}</strong>
      </div>
      <Stack gap={3} className="messages">
        {messages &&
          messages.map((message, index) => (
            <Stack
              key={index}
              className={`${
                message?.senderId === user?._id
                  ? "message self align-self-end flex-grow-0"
                  : "message align-self-start flex-grow-0"
              } message-container`}
              ref={scroll}
              direction="horizontal"
              gap={2}
            >
              <div className="message-content">
                <span>{message.text}</span>
                {translations[message._id] && (
                  <>
                  <hr style={{ margin: "8px 0",border:"2px solid #ccc" }} />
                  <span className="translated-text">{translations[message._id]}</span>
                  </>
                )}
                <span className="message-footer">
                  {moment(message.createdAt).calendar()}
                </span>
              </div>

              {message.senderId !== user?._id && (
                <button className="translate-btn" onClick={() => handleTranslate(message)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-translate"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
                    <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
                  </svg>
                </button>
              )}
            </Stack>
          ))}
      </Stack>

      <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
        <InputEmoji 
          value={textMessage} 
          onChange={setTextMessage} 
          fontFamily="Open-Sans" 
          borderColor="rgba(72,112,223,0.2)" 
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" 
          onClick={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            fill="currentColor" 
            className="bi bi-send" 
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
