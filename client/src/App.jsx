import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login";
import Chat from "./pages/chat";
import "bootstrap/dist/css/bootstrap.min.css";
import {Container} from "react-bootstrap";
import NavBar from "./components/NavBar";

function App() {
  return (
   <>
   <NavBar/>
    <Container className="text-secondary">
    <Routes>
      <Route path="/" element ={<Chat/>}/>
      <Route path="/Login" element ={<Login/>}/>
      <Route path="*" element ={<Navigate to ="/"/>}/>
    </Routes>
    </Container>
    </>
  );
}

export default App;
