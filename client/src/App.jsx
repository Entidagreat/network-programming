import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import NavBar from "./components/NavBar";
import Register from "./pages/Register";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ThemeProvider>
    <LanguageProvider>
    <ChatContextProvider user={user}>
      <NavBar />
      <Container>
        <Routes>
          <Route path="/" element={user ? <Chat /> : <Login />} />
                                      {/* Only allow access to Register if user is admin */}
                            <Route path="/Register" element={
                                user?.email === 'admin@gmail.com' ? (
                                    <Register />
                                ) : (
                                    <Navigate to="/" />
                                )
                            } />
          <Route path="/Login" element={user ? <Chat /> : <Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </ChatContextProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
