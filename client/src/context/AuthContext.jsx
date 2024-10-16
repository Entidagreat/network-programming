import { createContext, useCallback, useState } from "react";  // Import the createContext function from the React library
import { baseUrl, postRequest } from "../utils/services";  // Import the postRequest function from the requests file
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({

    });


    console.log("registerInfo: ", registerInfo);

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setRegisterError(null);
        const response = await postRequest('${baseUrl}/users/register', JSON.stringify(registerInfo));
        setIsRegisterLoading(false);
        if (response.error) {
            return setRegisterError(response);
        }
        localStorage.setItem('user', JSON.stringify(response));
        setUser(response);
    }, [registerInfo]);

    return (
        <AuthContext.Provider
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};