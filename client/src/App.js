import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NavBar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { Container } from './components/Container/Container';

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />

      <div className='content' style={{ background: `url("/images/background.jpg") no-repeat center center fixed` }}>
        <Container>
          <Outlet />
        </Container>
      </div>

      <Footer />
    </>
  );
}

export default App;
