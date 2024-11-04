// src/pages/Login.jsx
import { Alert, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Login = () => {
    const {
        loginUser,
        loginInfo,
        loginError,
        updateLoginInfo,
        isLoginLoading,
    } = useContext(AuthContext);
    
    const { language, setLanguage } = useContext(LanguageContext);
    const t = translations[language]; // Get translations for current language
    

    return (
        <Form onSubmit={loginUser}>
            <Row style={{
                height: "100vh",
                justifyContent: "center",
                paddingTop: "10%",
            }}>
                <Col xs={6}>
                    <Stack gap={3}>
                        <h2>{t.login.title}</h2>

                        {/* Language selector */}
                        <Form.Select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="mb-3"
                        >
                            <option value="en">English</option>
                            <option value="vn">Tiếng Việt</option>
                        </Form.Select>

                        <Form.Control 
                            type="email" 
                            placeholder={t.login.email}
                            onChange={(e) => updateLoginInfo({ 
                                ...loginInfo, 
                                email: e.target.value 
                            })} 
                        />
                        
                        <Form.Control 
                            type="password"
                            placeholder={t.login.password} 
                            onChange={(e) => updateLoginInfo({ 
                                ...loginInfo, 
                                password: e.target.value 
                            })}
                        />

                        <Button variant="primary" type="submit">
                            {isLoginLoading ? t.login.loading : t.login.button}
                        </Button>

                        {loginError?.error && (
                            <Alert variant="danger">
                                <p>{loginError?.message}</p>
                            </Alert>
                        )}
                    </Stack>
                </Col>
            </Row>
        </Form>
    );
};

export default Login;