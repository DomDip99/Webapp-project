import { useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { PiUserCircleThin } from "react-icons/pi";
import { LogoutButton } from "./Login";

function MyNavbar(props) {
    const navigate = useNavigate();

    return (
        <Navbar expand="md" className="text-light bg-primary px-2 py-3">
            <Container fluid>
                <Navbar.Brand className="text-light h2">What Do You Meme!</Navbar.Brand>
                <Nav className="col-9 justify-content-md-end">
                    {
                        props.logged ? 
                        <LogoutButton logout={props.handleLogout} /> :
                        <Button variant='outline-light' onClick={() => navigate('/')}>Login</Button>
                    }
                    <Nav.Item>
                        <PiUserCircleThin size={40}/>
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default MyNavbar;