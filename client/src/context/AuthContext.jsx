import { useCallback } from "react";
import { createContext, useState } from "react";
import { baseUrl, postRequest } from "../utils/services";
import { useEffect } from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loginError, setLoginError] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    console.log("Userr ", user);
    console.log("loginInfo ", loginInfo);
    useEffect(() => {
        console.log("loginInfo ", loginInfo);
    }, [loginInfo]);
    useEffect(() => {
        const user = localStorage.getItem("User");

        setUser(JSON.parse(user));
    }, []);

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, []);
    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    const registerUser = useCallback(async (e) => {
        e.preventDefault();

        setIsRegisterLoading(true);
        setRegisterError(null);

        const response = await postRequest(
            `${baseUrl}/users/register`,
            JSON.stringify(registerInfo)
        );

        setIsRegisterLoading(false);

        if (response.error) {
            return setRegisterError(response);
        };

        localStorage.setItem("user", JSON.stringify(response));
        setUser(response);
    }, [registerInfo]);

    const loginUser = useCallback(async (e) => {
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError(null);
        const response = await postRequest(
            `${baseUrl}/users/login`,
            JSON.stringify(loginInfo)
        );
        setIsLoginLoading(false);
        if (response.error) {
            return setLoginError(response);
        }
        localStorage.setItem("User", JSON.stringify(response));
        setUser(response);
    }, [loginInfo]);

   

    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                logoutUser,
                loginUser,
                loginInfo,
                loginError,
                updateLoginInfo,
                isLoginLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};  