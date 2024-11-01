import { useContext, useState } from "react";
import { Alert, Button, Form, Row, Col, Stack, Image } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
    const { registerInfo, updateRegisterInfo, registerUser, registerError, isRegisterLoading } = useContext(AuthContext);
    const [previewImage, setPreviewImage] = useState(null);
    const [fileError, setFileError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileError(null);

        // Validate file
        if (file) {
            // Check file type
            if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
                setFileError("Please upload an image file (jpg, png, gif)");
                return;
            }
            // Check file size (e.g., 5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setFileError("File size must be less than 5MB");
                return;
            }

            updateRegisterInfo({ ...registerInfo, profilePicture: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Form onSubmit={registerUser} encType="multipart/form-data">
            <Row style={{ height: "100vh", justifyContent: "center", paddingTop: "10%" }}>
                <Col xs={6}>
                    <Stack gap={3}>
                        <h2>Register</h2>

                        {previewImage && (
                            <div className="text-center">
                                <Image 
                                    src={previewImage} 
                                    roundedCircle 
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                            </div>
                        )}

                        <Form.Group>
                            <Form.Label>Profile Picture</Form.Label>
                            <Form.Control 
    type="file" 
    accept="image/jpeg,image/png,image/gif"
    onChange={handleFileChange}
    name="image"  // Thêm thuộc tính name="image"
/>
{fileError && <Alert variant="danger" className="mt-2">{fileError}</Alert>}
                        </Form.Group>

                        <Form.Control 
                            type="text" 
                            placeholder="Name" 
                            required
                            onChange={(e) =>
                                updateRegisterInfo({ ...registerInfo, name: e.target.value })
                            } 
                        />
                        <Form.Control 
                            type="email" 
                            placeholder="Email" 
                            required
                            onChange={(e) =>
                                updateRegisterInfo({ ...registerInfo, email: e.target.value })
                            } 
                        />
                        <Form.Control 
                            type="password" 
                            placeholder="Password" 
                            required
                            onChange={(e) =>
                                updateRegisterInfo({ ...registerInfo, password: e.target.value })
                            } 
                        />
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isRegisterLoading || fileError}
                        >
                            {isRegisterLoading ? "Creating your account..." : "Register"}
                        </Button>
                        {registerError?.error && (
                            <Alert variant="danger">
                                <p>{registerError?.message}</p>
                            </Alert>
                        )}
                    </Stack>
                </Col>
            </Row>
        </Form>
    );
};

export default Register;