import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react';
import { LoginForm } from "./components/Login";
import Home from "./components/Home";
import GamePage from './components/GameComponents';
import ErrorRoute from "./components/NotFound";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');

  const loginSuccess = (user) => {
    setLoggedIn(true);
    setUser(user);
  }

  const handleLogout = async () => {
    setLoggedIn(false);
    setUser('');
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={(loggedIn) ? <Navigate replace to={'/home'}/> : <LoginForm logged={loginSuccess}/>}/>
          <Route path='/home' element={<Home logged={loggedIn} user={user} handleLogout={handleLogout} />}/>
          <Route path='/home/game' element={ <GamePage logged={loggedIn} user={user} handleLogout={handleLogout} /> }/>
          <Route path='/*' element={ <ErrorRoute /> }/>
        </Routes>
      </BrowserRouter>
    </>
    
  )
}



export default App
