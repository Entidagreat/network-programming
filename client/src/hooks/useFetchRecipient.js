import { useEffect, useState } from "react";
import { baseUrl, getRequest } from "../utils/services";

export const useFetchRecipientUser = (chat, user) => {
    const [recipientUser, setRecipientUser] = useState(null);
    const [error, setError] = useState(null);

    const recipientId = chat?.members?.find((id) => id !== user?._id);
 

    useEffect(() => {
        const getUser = async () => {
            if (!recipientId) return null;
    
            try {
                const response = await getRequest(`${baseUrl}/users/find/${recipientId}`);
                setRecipientUser(response);
            } catch (error) {
                if (error.response.status === 404) {
                    console.log("Không tìm thấy người dùng");
                    setRecipientUser(null); // Hoặc hiển thị thông báo lỗi
                } else {
                    console.error("Lỗi khi gọi API:", error);
                }
            }
        };
    
        getUser();
    }, [recipientId]);

    return {recipientUser};

};