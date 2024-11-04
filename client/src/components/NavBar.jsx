import { useContext } from "react";
import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notification from "./chat/Notification";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../utils/translations";

const NavBar = () => {

    const { user, logoutUser } = useContext(AuthContext);
    const { language } = useLanguage();
    const t = translations[language];
    return (
        // <Navbar bg="white" className="mb-4" style={{ height: "3.75rem" }}>
        <Navbar style={{ backgroundColor: "#af8260", height: "3.75rem" }} className="mb-4">
            <Container>
                <h2>
                    <Link to="/" className="link-light text-decoration-none">
                        4FG Co-op
                    </Link>
                </h2>
                {user && (
                    <span>{t.Navbar.loginname} {user?.name} </span>
                )}
                <Nav>
                    <Stack direction="horizontal" gap={3}>
                        {
                            user && (
                                <>
                                    <Notification />
                                    <Link onClick={() => logoutUser()} to="/login" className="link-light text-decoration-none">
                                        {t.Navbar.logout}
                                    </Link>
                                </>)
                        }

                        {!user && (<>
                            <Link to="/login" className="link-light text-decoration-none">
                                {t.Navbar.login}
                            </Link>
                            <Link to="/Register" className="link-light text-decoration-none">
                                {t.Navbar.register}
                            </Link>
                        </>)}

                    </Stack>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;
