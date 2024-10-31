import { useContext } from "react";
import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notification from "./chat/Notification";

const NavBar = () => {

    const { user, logoutUser } = useContext(AuthContext);

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
                    <span >Logged in as {user?.name}</span>
                )}
                <Nav>
                    <Stack direction="horizontal" gap={3}>
                        {
                            user && (
                                <>
                                    <Notification />
                                    <Link onClick={() => logoutUser()} to="/login" className="link-light text-decoration-none">
                                        Logout
                                    </Link>
                                </>)
                        }

                        {!user && (<>
                            <Link to="/login" className="link-light text-decoration-none">
                                Login
                            </Link>
                            <Link to="/Register" className="link-light text-decoration-none">
                                Register
                            </Link>
                        </>)}

                    </Stack>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;
