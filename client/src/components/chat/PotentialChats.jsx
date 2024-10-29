import { useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";

const PotentialChats = ({ setRefresh }) => { // Nhận props setRefresh từ component Chat
    const { user } = useContext(AuthContext);
    const { potentialChats, createChat, onlineUsers, setPotentialChats, updateUserChats } = useContext(ChatContext); // Import updateUserChats

    const deleteUser = useCallback(async (userId) => {
      try {
          await axios.delete(`/api/users/${userId}`);
          const updatedPotentialChats = potentialChats.filter((u) => u._id !== userId);
          setPotentialChats(updatedPotentialChats);
          updateUserChats(); // Cập nhật userChats trong context
      } catch (error) {
          console.error("Lỗi khi xóa người dùng:", error);
      }
  }, [potentialChats, setPotentialChats, updateUserChats]);

    return (
        <div className="all-users">
            {potentialChats &&
                potentialChats.map((u, index) => (
                    <div
                        className="single-user"
                        key={index}
                        onClick={() => createChat(user._id, u._id)}
                    >
                        {u.name}
                        <span className={
                            onlineUsers?.some((user) => user?.userId === u?._id)
                                ? "user-online"
                                : ""
                        }
                        ></span>
                        <button onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra div cha
                            deleteUser(u._id);
                        }}>Delete</button>
                    </div>
                ))}
        </div>
    );
};

export default PotentialChats;