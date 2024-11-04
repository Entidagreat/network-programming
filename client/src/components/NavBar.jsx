import { useContext } from "react";
import { Container, Nav, Navbar, Stack, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notification from "./chat/Notification";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { translations } from "../utils/translations";
import '../index.css';
import '../index1.css';

const NavBar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { language } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const t = translations[language];

    return (
        <Navbar className="navbar-custom mb-4">
            <Container>
                <h2>
                    <Link to="/" className="link-light text-decoration-none">
                        4FG Co-op
                    </Link>
                </h2>
                {user && (
                    <span>{t.Navbar.loginname} {user?.name}</span>
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
                            label={<span style={{color: 'white'}}>{isDarkMode ? '🌙' : '☀️'}</span>}
                        />
                    </Stack>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;