import { useContext, useState, useRef } from "react";
import { Container, Nav, Navbar, Stack, Form, Dropdown, Modal, Button, Alert } from "react-bootstrap";
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
import avartar from "../assets/avartar.svg";

const NavBar = () => {
  const { user, logoutUser, setUser } = useContext(AuthContext);
  const { language } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const t = translations[language];
  const avatarInputRef = useRef(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(null);

  const handleAvatarChange = async (event) => {
    const newAvatar = event.target.files[0];
    if (!user) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('avatar', newAvatar);

      const response = await axios.put(`${baseUrl}/users/update-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      const updatedUserResponse = await axios.get(`${baseUrl}/users/find/${user._id}`);
      console.log('Cập nhật avatar thành công:', updatedUserResponse.data);

      setUser(updatedUserResponse.data);
      console.log("setUser:", setUser);
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
    }
  };

  const handleShowChangePasswordModal = () => setShowChangePasswordModal(true);
  const handleCloseChangePasswordModal = () => setShowChangePasswordModal(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      return setChangePasswordError('New password and confirm password do not match');
    }

    try {
        const response = await axios.put(
            `${baseUrl}/users/change-password`,
            {
              userId: user._id,
              oldPassword,
              newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

      if (response.status === 200) {
        setChangePasswordSuccess('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        handleCloseChangePasswordModal();
      }
    } catch (error) {
      setChangePasswordError(error.response?.data?.message || 'Failed to change password');
    }
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
              <span style={{ marginLeft: '5px' }}>{user?.name}</span>
              <Dropdown align="end">
                <Dropdown.Toggle variant="none" id="dropdown-avatar">
                  <img
                    src={user?.avatar || avartar}
                    alt="Avatar"
                    width="30"
                    height="30"
                    style={{ borderRadius: '50%', cursor: 'pointer', marginLeft: '3px', marginBottom: '3px' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = avartar }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => avatarInputRef.current.click()}>
                    Thay đổi avatar
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleShowChangePasswordModal}>
                    Đổi mật khẩu
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
            {user ? (
              <>
                <Notification />
                <Link
                  onClick={() => logoutUser()}
                  to="/login"
                  className="link-light text-decoration-none"
                >
                  {t.Navbar.logout}
                </Link>
                {user.email === 'admin@gmail.com' && (
                  <Link
                    to="/Register"
                    className="link-light text-decoration-none"
                  >
                    Register
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="link-light text-decoration-none">
                  {t.Navbar.login}
                </Link>
                {/* <Link to="/register" className="link-light text-decoration-none">
                  {t.Navbar.register}
                </Link> */}
              </>
            )}
          </Stack>
        </Nav>
      </Container>

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={handleCloseChangePasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>Đổi Mật Khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {changePasswordError && <Alert variant="danger">{changePasswordError}</Alert>}
          {changePasswordSuccess && <Alert variant="success">{changePasswordSuccess}</Alert>}
          <Form onSubmit={handleChangePassword}>
            <Form.Group controlId="oldPassword">
              <Form.Label>Mật khẩu cũ</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="newPassword">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Đổi mật khẩu
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default NavBar;