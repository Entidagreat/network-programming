import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext  } from "../../context/ChatContext";
 import { io } from "socket.io-client";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";   
 // Giữ lại hook này
import moment from "moment";
import 'moment/locale/vi';
import InputEmoji from "react-input-emoji";
import { translateToEnglish, translateToVietnamese, translateToChinese, translateToKorean, translateToRussian } from "../../utils/translate";
import he from "he";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../utils/translations";
import { baseUrl } from "../../utils/services";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const { currentChat, messages, isMessagesLoading, sendTextMessage, socket } = useContext(ChatContext); // Lấy socket từ context
  const { recipientUser } = useFetchRecipientUser(currentChat, user);
  const [textMessage, setTextMessage] = useState("");
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const scroll = useRef();
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (language === 'vn') {
      moment.locale('vi');
    } else {
      moment.locale('en');
    }
  }, [language]);
  // useEffect(() => {
  //   const newSocket = io("http://localhost:3000");
  //   setSocket(newSocket);
  
  //   // Gửi userId khi kết nối
  //   newSocket.on('connect', () => {
  //     newSocket.emit('addUser', user._id); 
  //   });
  
  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);
  useEffect(() => {
    setTranslatedMessages({});
  }, [currentChat]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (selectedFile) {
        sendFile(selectedFile);
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
      } 

      if (currentChat?.isGroup) {
        sendTextMessage(textMessage, user, currentChat._id, setTextMessage, true); 
      } else {
        sendTextMessage(textMessage, user, currentChat._id, setTextMessage);
      }
    }
  };

  useEffect(() => {
    console.log('currentChat:', currentChat);
    console.log('message:', messages);
    console.log('member:', currentChat?.members);
  }, [currentChat, messages]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (socket) {
      console.log("Dữ liệu gửi đi:", { 
        chatId: currentChat._id,
        senderId: user._id,
        recipientId: currentChat.isGroup ? null : currentChat.members.find(id => id !== user._id),
        groupId: currentChat.isGroup ? currentChat._id : null,
        file: file
      });

      socket.emit('sendFile', { 
        chatId: currentChat._id,
        senderId: user._id,
        recipientId: currentChat.isGroup ? null : currentChat.members.find(id => id !== user._id),
        groupId: currentChat.isGroup ? currentChat._id : null,
        file: file 
      }, (response) => {
        if (response.status === "sent") {
          console.log("File đã được gửi thành công", response); 
          setMessages(prevMessages => [...prevMessages, response.newMessage]); 
        } else {
          console.error("Lỗi gửi file:", response.error);
        }
      });
    }
  };

  const sendFile = (file) => {
    if (socket) {
      socket.emit('sendFile', { 
        chatId: currentChat._id,
        senderId: user._id,
        recipientId: currentChat.isGroup ? null : currentChat.members.find(id => id !== user._id),
        groupId: currentChat.isGroup ? currentChat._id : null,
        file: file 
      }, (response) => {
        if (response.status === "sent") {
          console.log("File đã được gửi thành công");
          // Cập nhật UI
        } else {
          console.error("Lỗi gửi file:", response.error);
          // Hiển thị thông báo lỗi
        }
      });
    } else {
      console.error("Socket.IO chưa được khởi tạo.");
      // Xử lý lỗi, ví dụ: hiển thị thông báo cho người dùng
    }
  };















  const handleTranslate = async (message) => {
    try {
      if (translatedMessages[message._id]) {
        return; // Nếu đã dịch rồi thì không cần dịch lại
      }

      let translatedText;
      if (language === 'en') {
        translatedText = await translateToEnglish(message.text);
      } else if (language === 'vn') {
        translatedText = await translateToVietnamese(message.text);
      } else if (language === 'ko') {
        translatedText = await translateToKorean(message.text);
      } else if (language === 'zh') {
        translatedText = await translateToChinese(message.text);
      } else if (language === 'ru') {
        translatedText = await translateToRussian(message.text);
      }
      const decodedText = he.decode(translatedText);
      setTranslatedMessages(prev => ({ ...prev, [message._id]: decodedText }));
    } catch (error) {
      console.error("Error translating message:", error);
    }
  };

  if (!user) {
    return <p style={{ textAlign: "center", width: "100%" }}>Loading user...</p>;
  }

  if (!currentChat) { 
    return (
      <p style={{ textAlign: "center", width: "100%" }}>
        {t.ChatBox.noConversation}
      </p>
    );
  }

  if (isMessagesLoading) {
    return <p style={{ textAlign: "center", width: "100%" }}>Loading Chat...</p>;
  }

  return (
    <Stack gap={4} className="chat-box">
      <div className="chat-header">   

        {/* Hiển thị tên nhóm hoặc tên người nhận */}
        <strong>
          {currentChat?.isGroup 
            ? currentChat.name 
            : recipientUser?.name // Sử dụng recipientUser.name
          }
        </strong> 
      </div>
      

      
      
      <Stack gap={3} className="messages">
        {messages && messages.map((message, index) => (
          <Stack
            key={index}
            className={`${message?.senderId === user?._id
              ? "message self align-self-end flex-grow-0"
              : "message align-self-start flex-grow-0"   

              } `}
            direction="horizontal"
            gap={2}
            onMouseEnter={() => setHoveredMessageId(message._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
            ref={scroll}
          >
             {/* Hiển thị tên người gửi */}
             {message?.senderId !== user?._id && (
              <div className="sender-name">
                {currentChat?.isGroup ? (
                  // Hiển thị tên người gửi trong nhóm
                  currentChat.members.find(member => member.user === message?.senderId)?.username || 'Unknown User' 
                ) : (
                  // Hiển thị tên người nhận trong tin nhắn 1-1
                  recipientUser?.name || 'Unknown User' 
                )}
              </div>
            )}

         <div className="message-content" style={{ 
          position: 'relative', 
          flexGrow: 1 ,
          maxWidth: '100%',          // Contain width
          // overflowX: 'hidden',       // Prevent horizontal scroll
          wordBreak: 'break-word',   // Break long words
          whiteSpace: 'pre-wrap',    // Preserve line breaks but wrap text
          overflowWrap: 'break-word'
          }}>    
  {/* {message?.senderId !== user?._id && (
    <div className="sender-name" style={{display:'flex', position:'rela', alignItems:'center'}}>
      {currentChat?.isGroup ? (
        // For group chat, show sender's username
        currentChat.members?.find(member => 
          member.user === message?.senderId
        )?.username || 'Unknown User'
      ) : (
        // For direct chat, show recipient's name
        recipientUser?.name || 'Unknown User'
      )}
    </div>
  )} */}
  <span>{message?.text}</span>
   {/* Hiển thị file */}
  {message?.file && (
                <div>
                  {message.file.mimetype.startsWith('image/') ? (
                    <img 
                      src={message.file.url} 
                      alt={message.file.filename} 
                      style={{ maxWidth: '100px', maxHeight: '50px' }} 
                    />
                  ) : message.file.mimetype.startsWith('video/') ? (
                    <video 
                      src={message.file.url} 
                      controls 
                      style={{ maxWidth: '100px', maxHeight: '50px' }} 
                    />
                  ) : (
                    <a href={message.file.url} target="_blank" rel="noopener noreferrer">
                      {message.file.filename}
                    </a>
                  )}
                </div>
              )}
  {translatedMessages[message?._id] && (
    <>
      <hr style={{ margin: "8px 0", border: "2px solid #ccc" }} />
      <span className="translated-text">{translatedMessages[message._id]}</span>
    </>
  )}
    {message?.senderId !== user?._id && (
    <div className="sender-name" style={{display:'flex', position:'rela', alignItems:'center'}}>
      {currentChat?.isGroup ? (
        // For group chat, show sender's username
        currentChat.members?.find(member => 
          member.user === message?.senderId
        )?.username || 'Unknown User'
      ) : (
        // For direct chat, show recipient's name
        recipientUser?.name || 'Unknown User'
      )}
    </div>
  )}
              {hoveredMessageId === message._id && (
                <span
                  className="message-footer"
                  style={{
                    position: 'absolute',
                    bottom: '-32px',
                    right: message.senderId === user?._id ? '0' : 'auto',
                    left: message.senderId !== user?._id ? '0' : 'auto',
                    textAlign: message.senderId === user?._id ? 'right' : 'left',
                  }}
                >
                  {moment(message.createdAt).calendar()}
                </span>
              )}
            </div>
              {message.senderId !== user?._id && (
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <button
                    className="translate-btn"
                    onClick={() => handleTranslate(message)}
                    style={{ position: "absolute", left: "25px" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-translate"
                      viewBox="0 0 15 15"
                    >
                      <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
                      <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
                    </svg>
                  </button>
                </div>
              )}
            </Stack>
          ))}
      </Stack>

      <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
      <div style={{
    width: "100%", // chiều rộng tối đa
    maxWidth: "750px", // chiều rộng tối đa (có thể điều chỉnh)
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  }}>
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          fontFamily="Open-Sans"
          borderColor="rgba(72,112,223,0.2)"
          onKeyDown={handleKeyDown}
          cleanOnEnter
          placeholder="Type a message"
          maxLength={1000}
          // Add these props for text wrapping
          height="auto"
          maxHeight={100} // Maximum height before scrolling
          style={{
            overflow: 'auto',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
          </div>
          <input 
  type="file" 
  id="fileInput" 
  style={{ display: 'none' }} 
  onChange={handleFileChange} // Gọi hàm xử lý khi chọn file
/>
                 <button
           className="send-file"
           onClick={() => document.getElementById('fileInput').click()} // Kích hoạt input file
           style={{
            color: '#37342d',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 'inherit'
          }}
          >
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="22" 
            height="22" 
            fill="currentColor" 
            className="bi bi-paperclip" 
            viewBox="0 0 16 16">
         <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
        </svg>
          </button>
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
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
          </svg>
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
