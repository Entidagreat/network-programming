import { createContext, useSate } from "react";
export const AuthContext = createContext();
export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState({
        name: "Charles",
    });
    return (
        <AuthContext.Provider value={{user,}}>
            {children}
        </AuthContext.Provider>
    );
};