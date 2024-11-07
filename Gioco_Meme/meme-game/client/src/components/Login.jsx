import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Form, Button, Row, Col, Alert, Container } from 'react-bootstrap';
import API from "../API.mjs";

function LoginForm(props) {
  const [username, setUsername] = useState('utente.storico@email.com');
  const [password, setPassword] = useState('aaaaaa');
  const [message, setMessage] = useState(); 

  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      props.logged(user);
    }catch(err) {
      setMessage('Credenziali errate');
    }
  };
  
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      handleLogin(credentials);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center mt-4 mb-4" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={12}>
          <h2 className="mb-4">What Do you Meme!</h2>
          <Form onSubmit={handleSubmit} className="text-center">
            { message ? <Alert variant='danger' dismissible onClick={() => setMessage('')} >{message}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Inserisci lo username</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Inserisci la password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true} minLength={6}/>
            </Form.Group>
            <Button variant='primary' type='submit' className="mr-2 mt-6">Login</Button>{' '}
            <Button variant='secondary' onClick={() => navigate('/home')}>Entra come ospite</Button>
          </Form>
        </Col>
      </Row>
    </Container>
    
  )
};

function LogoutButton(props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await API.logOut();
    props.logout();
    navigate('/');
  }

  return(
    <Button variant='outline-light' onClick={handleLogout}>Logout</Button>
  )
}

export { LoginForm, LogoutButton };