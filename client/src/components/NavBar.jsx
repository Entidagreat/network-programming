import { useContext, useState, useRef } from "react";
import { Container, Nav, Navbar, Stack, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notification from "./chat/Notification";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { translations } from "../utils/translations";
import '../index.css';
import '../index1.css';
import axios from "axios";
import { baseUrl } from "../utils/services";
import avartar from "../assets/avartar.svg"; // Import ảnh mặc định

const NavBar = () => {
    const { user, logoutUser, setUser } = useContext(AuthContext);
    const { language } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const t = translations[language];
    const avatarInputRef = useRef(null);

    const handleAvatarChange = async (event) => {
        const newAvatar = event.target.files[0];
        if (!user) { 
            console.error("Người dùng chưa đăng nhập");
            return; 
          }
        try {
            const formData = new FormData();
            formData.append('avatar', newAvatar);

            // Gửi request PUT đến API endpoint /update-avatar
            const response = await axios.put(`${baseUrl}/users/update-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${user?.token}` 
                  }
            });

            // Cập nhật Context với thông tin người dùng mới (bao gồm avatar)
const updatedUserResponse = await axios.get(`${baseUrl}/users/find/${user._id}`);            console.log('Cập nhật avatar thành công:', updatedUserResponse.data);
    
            setUser(updatedUserResponse.data); // Sử dụng setUser để cập nhật context
            console.log("setUser:", setUser);
        } catch (error) {
            console.error("Lỗi khi cập nhật avatar:", error);
            // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi cho người dùng)
        }
    };

    const handleAvatarClick = () => {
        avatarInputRef.current.click();
    };

    return (
        <Navbar className="navbar-custom mb-4">
            <Container>
                <h2>
                    <Link to="/" className="link-light text-decoration-none">
                        4FG Co-op
                    </Link>
                </h2>
                {user && (
                    <>
                        <span>
                            {t.Navbar.loginname},
                            <img
                                src={user?.avatar || avartar}
                                alt="Avatar"
                                width="30"
                                height="30"
                                style={{ borderRadius: '50%', cursor: 'pointer' ,marginLeft: '3px', marginBottom: '3px'}}
                                onError={(e) => { e.target.onerror = null; e.target.src = avartar }}
                                onClick={handleAvatarClick}
                            />
                           <span style={{ marginLeft: '5px' }}>{user?.name}</span>
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                        />
                    </>
                )}
                <Nav className="d-flex align-items-center">
                    <Stack direction="horizontal" gap={3}>
                        {user && (
                            <>
                                <Notification />
                                <Link onClick={() => logoutUser()} to="/login" className="link-light text-decoration-none">
                                    {t.Navbar.logout}
                                </Link>
                            </>
                        )}
                        {!user && (
                            <>
                                <Link to="/login" className="link-light text-decoration-none">
                                    {t.Navbar.login}
                                </Link>
                                <Link to="/Register" className="link-light text-decoration-none">
                                    {t.Navbar.register}
                                </Link>
                            </>
                        )}
                        <Form.Check
                            type="switch"
                            id="theme-switch"
                            checked={isDarkMode}
                            onChange={toggleTheme}
                            label={<span style={{ color: 'white' }}>{isDarkMode ? '🌙' : '☀️'}</span>}
                        />
                    </Stack>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;
