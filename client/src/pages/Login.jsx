// src/pages/Login.jsx
import { Alert, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import logotabgz from '../assets/loginbgz.jpg';
import { useEffect } from 'react';


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

    useEffect(() => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
          document.body.classList.add('blurred-dark');
        } else {
          document.body.classList.add('blurred-light');
        }
      
        return () => {
          document.body.classList.remove('blurred-dark');
          document.body.classList.remove('blurred-light');
        };
      }, []);
      

    return (
        <Form onSubmit={loginUser} className="login">
            <div className="column">
                <Row style={{
                    height: "100vh",
                    justifyContent: "center",
                    paddingTop: "10%",
                    width: "100%",
                    marginTop: "23%",  
                }}>
                    <Col xs={8}>
                        <Stack gap={3}>
                            <h2 style={{ textAlign: 'center' }}>{t.login.title}</h2>
                            {/* Language selector */}
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
                            <Form.Select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mb-3"
                            >
                                <option value="vn">Tiếng Việt</option>
                                <option value="en">English</option>
                                <option value="zh">Chinese </option>
                                <option value="ko">Korean</option>
                                <option value="ru">Russian</option>
                            </Form.Select>

                            <Button 
                                variant="primary" 
                                type="submit"
                                className='login-submit'
                            >
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
            </div>
            <div className="column column--bg">
                <img className="bg-img" src={logotabgz} />
            </div>
        </Form>
    );
};

export default Login;