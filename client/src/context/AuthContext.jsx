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
        profilePicture: null
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

    // Update the registerUser function
// 1. First, verify the content type is properly set for FormData
const registerUser = useCallback(async (e) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError(null);

    try {
        // Input validation
        if (!registerInfo.name || !registerInfo.email || !registerInfo.password) {
            throw new Error('Please fill all required fields');
        }

        const formData = new FormData();
        formData.append('name', registerInfo.name);
        formData.append('email', registerInfo.email);
        formData.append('password', registerInfo.password);

        // Use 'image' field name to match Multer config
        if (registerInfo.profilePicture instanceof File) {
            formData.append('image', registerInfo.profilePicture);
            console.log('File details:', {
                name: registerInfo.profilePicture.name,
                type: registerInfo.profilePicture.type,
                size: registerInfo.profilePicture.size
            });
        }

        const response = await fetch(`${baseUrl}/users/register`, {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get('content-type');
        
        // Handle non-JSON responses
        if (contentType?.includes('text/html')) {
            const text = await response.text();
            console.error('Server returned HTML:', text);
            throw new Error('Server error - please try again');
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }

        localStorage.setItem('User', JSON.stringify(data));
        setUser(data);

    } catch (error) {
        console.error('Registration error:', error);
        setRegisterError({
            error: true,
            message: error.message || 'Registration failed'
        });
    } finally {
        setIsRegisterLoading(false);
    }
}, [registerInfo, baseUrl]);
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
        setLoginInfo({ email: "", password: "" }); // Clear loginInfo
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