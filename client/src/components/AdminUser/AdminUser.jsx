import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Modal,
    Form
} from 'react-bootstrap';
import './style.css'

export const AdminUser = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);

    const [userName, setUserName] = useState('');
    const [userLogin, setUserLogin] = useState('');
    const [userPass, setUserPass] = useState('');
    const [userGroup, setUserGroup] = useState('');
    const [userAdmin, setUserAdmin] = useState(false);

    const [userNameModal, setUserNameModal] = useState('');
    const [userLoginModal, setUserLoginModal] = useState('');
    const [userPassModal, setUserPassModal] = useState('');
    const [userGroupModal, setUserGroupModal] = useState('');
    const [userAdminModal, setUserAdminModal] = useState(false);
    const [userIDModal, setUserIDModal] = useState('');

    const [status, setStatus] = useState('');
    const [isShowModal, setIsShowModal] = useState(false);

    const closeModal = () => setIsShowModal(false);
    const showModal = (name, login, group, admin, id) => {
        setUserNameModal(name);
        setUserLoginModal(login);
        setUserGroupModal(group);
        setUserAdminModal(admin);
        setUserIDModal(id);
        setIsShowModal(true)
    };

    const userAddHandler = function (ev) {
        ev.preventDefault();

        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("name", userName);
            urlencoded.append("login", userLogin);
            urlencoded.append("password", userPass);
            urlencoded.append("group", userGroup);
            urlencoded.append("admin", userAdmin);

            var requestOptions = {
                headers: myHeaders,
                method: 'POST',
                body: urlencoded
            };

            fetch("http://localhost:8000/admin/user", requestOptions)
                .then(response => response.text())
                .then(result => {
                    setStatus(result)
                })
                .catch(error => console.log('error', error));
        }

    }

    const userDeleteHandler = function (id, name) {

        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("id", id);
            urlencoded.append("name", name);

            var requestOptions = {
                headers: myHeaders,
                method: 'DELETE',
                body: urlencoded
            };

            fetch("http://localhost:8000/admin/user", requestOptions)
                .then(response => response.text())
                .then(result => {
                    setStatus(result);
                    searchSubmitHandler();
                })
                .catch(error => console.log('error', error));
        }
    }

    const userUpdateHandler = function () {

        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("name", userNameModal);
            urlencoded.append("login", userLoginModal);
            urlencoded.append("password", userPassModal);
            urlencoded.append("group", userGroupModal);
            urlencoded.append("admin", userAdminModal);
            urlencoded.append("userID", userIDModal);

            var requestOptions = {
                headers: myHeaders,
                method: 'PUT',
                body: urlencoded
            };

            fetch("http://localhost:8000/admin/user", requestOptions)
                .then(response => response.text())
                .then(result => {
                    setStatus(result);
                    searchSubmitHandler();
                    closeModal();
                })
                .catch(error => console.log('error', error));
        }
    }

    const searchSubmitHandler = function () {

        if (!token) {
            navigate('/');
        }
        else {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            var requestOptions = {
                headers: myHeaders,
                method: 'GET',
            };

            fetch(`http://localhost:8000/admin/user?query=${query}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    setUsers(result);
                })
                .catch(error => console.log('error', error));
        }

    }

    return (
        <>
            <Modal show={isShowModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>

                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Имя"
                                value={userNameModal}
                                onChange={ev => setUserNameModal(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicLogin">
                            <Form.Label>Логин</Form.Label>
                            <Form.Control
                                type="text"
                                name="login"
                                placeholder="Логин"
                                value={userLoginModal}
                                onChange={ev => setUserLoginModal(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Новый пароль"
                                name="password"
                                value={userPassModal}
                                onChange={ev => setUserPassModal(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicGroup">
                            <Form.Label>Группа</Form.Label>
                            <Form.Control
                                type="group"
                                placeholder="Группа"
                                name="group"
                                value={userGroupModal}
                                onChange={ev => setUserGroupModal(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicAdmin">
                            <Form.Label>Права администратора</Form.Label>
                            <Form.Check
                                type="switch"
                                name="admin"
                                onChange={ev => { setUserAdminModal(!userAdminModal) }}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={() => { userUpdateHandler() }}>Редактировать</Button>
                </Modal.Footer>
            </Modal>

            <div className="usersearch-block">

                <div className={`error-message error-userchange ${status ? 'active' : ''}`} >
                    {status}
                </div>
                <h2>Поиск пользователя:</h2>
                <div className="admin-search">
                    <form method="post">
                        <input
                            type="text"
                            name="admin-usersearch"
                            className="admin-input"
                            onChange={ev => setQuery(ev.target.value)}
                        />
                        <input
                            type="button"
                            name="admin-usersubmit"
                            value="Найти"
                            className="admin-querybtn"
                            onClick={() => { searchSubmitHandler() }}
                        />
                    </form>
                </div>

                <div className="admin-query">
                    {
                        users.map((user, i) => {
                            return (
                                <div className='admin-query__info-block' key={i}>
                                    <div className='info-block__name underline'>
                                        {`${user.name} (${user.login})`}
                                    </div>
                                    <div className='info-block__delete'>
                                        <form action='' method='post'>
                                            <input
                                                type='button'
                                                value='Удалить'
                                                name={`delete-user[${user._id}]`}
                                                className='info-block__button'
                                                onClick={() => { userDeleteHandler(user._id, user.name) }}
                                            />
                                            <input
                                                type='button'
                                                value='Редактировать'
                                                name='edituser'
                                                className='info-block__button info-block__edit'
                                                onClick={() => { showModal(user.name, user.login, user.group, user.admin, user._id) }}
                                            />
                                        </form>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="useradd-block">
                <h2>Добавление пользователя:</h2>
                <form method="post">
                    <div className="add-field first-field">
                        <label htmlFor="username">Имя: </label>
                        <input
                            type="text"
                            name="admin-username"
                            id="username"
                            className="admin-input"
                            required
                            onChange={ev => setUserName(ev.target.value)}
                        />
                    </div>
                    <div className="add-field sec-field">
                        <label htmlFor="login">Логин:</label>
                        <input
                            type="text"
                            name="admin-userlogin"
                            id="login"
                            className="admin-input"
                            required
                            onChange={ev => setUserLogin(ev.target.value)}
                        />
                    </div>
                    <div className="add-field">
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="text"
                            name="admin-userpass"
                            id="password"
                            className="admin-input"
                            required
                            onChange={ev => setUserPass(ev.target.value)}
                        />
                    </div>
                    <div className="add-field fourth-field">
                        <label htmlFor="group">Группа:</label>
                        <input
                            type="text"
                            name="admin-usergroup"
                            id="group"
                            className="admin-input"
                            onChange={ev => setUserGroup(ev.target.value)}
                        />
                    </div>
                    <div className="add-field">
                        <label htmlFor="ifadmin">Права администратора:</label>
                        <input
                            type="checkbox"
                            name="admin-useradmin"
                            id="ifadmin"
                            onChange={ev => { userAdmin ? setUserAdmin(false) : setUserAdmin(true) }}
                        />
                    </div>
                    <input
                        type="submit"
                        name="admin-useraddsubmit"
                        value="Добавить"
                        className="admin-querybtn"
                        onClick={userAddHandler}
                    />
                </form>
            </div>
        </>
    )
}