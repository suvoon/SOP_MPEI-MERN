import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Modal,
    Form
} from 'react-bootstrap';
import { useState, useEffect } from 'react';

export const NavBar = () => {

    const navigate = useNavigate();
    const [isAuth, setAuth] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setAuth(true)
        } else {
            setAuth(false)
        }
    }, [])

    const closeModal = () => setIsShowModal(false);
    const showModal = (ev) => {
        ev.preventDefault();
        setIsShowModal(true)
    };

    function handleLogin(ev) {
        ev.preventDefault();
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        let urlencoded = new URLSearchParams();
        urlencoded.append("login", login);
        urlencoded.append("password", password);

        var requestOptions = {
            headers: myHeaders,
            method: 'POST',
            body: urlencoded
        };

        fetch("http://localhost:8000/login", requestOptions)
            .then(response => response.json())
            .then(result => {
                if ('errors' in result) {
                    alert('Не получилось войти')
                } else {
                    console.log(result.desc);
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify({
                        name: result.name,
                        admin: result.admin,
                        desc: result.desc
                    }));
                    setAuth(true);
                    closeModal();
                    navigate('/');
                }
            })
            .catch(error => console.log('error', error));
    }

    const handleLogout = (ev) => {
        ev.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(false);
        setLogin("");
        setPassword("");
        navigate('/');
    }

    const profileMenu = <>
        <Link className='nav-link'>
            {JSON.parse(localStorage.getItem('user'))?.name}
        </Link>
        <div className="user__popup">
            <div className="user__info">
                <div className="user__image">
                    <img src={JSON.parse(localStorage.getItem('user'))?.admin ? "/images/admin.png" : "/images/student.jpg"} alt="empty" />
                </div>
                <div className="user__name">
                    {JSON.parse(localStorage.getItem('user'))?.name}
                </div>
            </div>
            <div className="user__profile">
                <Link to="/profile" className='nav-link'><div className="user__link">
                    Настройки профиля
                </div></Link>
                <Link className='nav-link' onClick={handleLogout}><div className="user__link">
                    Выход
                </div></Link>
                {JSON.parse(localStorage.getItem('user'))?.admin
                    ?
                    <Link to='/admin' className='nav-link'>
                        <div className='user__link admin-btn'>
                            Панель администратора
                        </div>
                    </Link>
                    : ''
                }
            </div>
        </div>
    </>

    return (
        <>
            <nav className="menu-bar">
                <div className="menu-bar__container container">
                    <ul className="menu-bar__list">
                        <li className="logo">
                            <Link to="/" className='nav-link'>
                                <img src="/images/mpei.jpg" width="40" height="40" alt="logo" />
                                <span>СОП МЭИ</span>
                            </Link>
                        </li>
                        <li><Link to="/surveys" className='nav-link'>Опрос</Link></li>
                        <li><Link to="/" className='nav-link'>Результаты</Link></li>
                        <li><Link to="/" className='nav-link'>Форум</Link></li>
                        <li className="user">
                            {isAuth
                                ? profileMenu
                                : <Link className='nav-link' onClick={showModal}>Вход</Link>
                            }
                        </li>
                    </ul>
                </div>
            </nav>

            <Modal show={isShowModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Вход</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>

                        <Form.Group className="mb-3" controlId="formBasicLogin">
                            <Form.Label>Логин</Form.Label>
                            <Form.Control
                                type="text"
                                name="login"
                                placeholder="Логин"
                                value={login}
                                onChange={ev => setLogin(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Пароль"
                                name="password"
                                value={password}
                                onChange={ev => setPassword(ev.target.value)}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={handleLogin}>Войти</Button>
                </Modal.Footer>
            </Modal>
        </>

    )
}