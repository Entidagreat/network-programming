import { useContext, useCallback, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";

const PotentialChats = ({ setRefresh }) => {
  const { user } = useContext(AuthContext);
  const {
    potentialChats,
    createChat,
    onlineUsers,
    setPotentialChats,
    updateUserChats,
  } = useContext(ChatContext);

  const deleteUser = useCallback(
    async (userId) => {
      try {
        await axios.delete(`/api/users/${userId}`);
        const updatedPotentialChats = potentialChats.filter(
          (u) => u._id !== userId
        );
        setPotentialChats(updatedPotentialChats);
        updateUserChats();
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
      }
    },
    [potentialChats, setPotentialChats, updateUserChats]
  );

  // useEffect để tự động thêm user vào chatlist khi component mount
  useEffect(() => {
    const addUsersToChatList = async () => {
      try {
        for (const potentialUser of potentialChats) {
          await createChat(user._id, potentialUser._id);
        }
      } catch (error) {
        console.error("Lỗi khi thêm user vào chatlist:", error);
      }
    };

    addUsersToChatList();
  }, [potentialChats, createChat, user._id]);

  return (
    <div className="all-users">
      {potentialChats &&
        potentialChats.map((u) => (
          <div className="single-user" key={u._id}>
            {u.name}
            <span
              className={
                onlineUsers?.some((user) => user?.userId === u?._id)
                  ? "user-online"
                  : ""
              }
            ></span>

          </div>
        ))}
    </div>
  );
};

export default PotentialChats;