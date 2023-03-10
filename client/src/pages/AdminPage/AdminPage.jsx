import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { SurveysTable } from '../../components/SurveysTable/SurveysTable';
import {
    Button,
    Modal,
    Form
} from 'react-bootstrap';
import './style.css'

export const AdminPage = () => {
    //TODO: Разбить табы по компонентам хотя бы

    const navigate = useNavigate();
    const [openTab, setOpenTab] = useState(true);
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

    const [status, setStatus] = useState('');
    const [isShowModal, setIsShowModal] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const [createSurvey, setCreateSurvey] = useState(false);
    const [surveyBlocks, setSurveyBlocks] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (redirect) {
            setRedirect(false);
            navigate('/');
        }
    }, [redirect, navigate]);

    const closeModal = () => setIsShowModal(false);
    const showModal = (name, login, group, admin) => {
        setUserNameModal(name);
        setUserLoginModal(login);
        setUserGroupModal(group);
        setUserAdminModal(admin);
        setIsShowModal(true)
    };

    const surveySubmitHandler = function (ev) {
        setRedirect(true);
    };

    //TODO: useEffect admin check

    const searchSubmitHandler = function () {
        console.log('first')

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
            // urlencoded.append("id", id);
            // urlencoded.append("name", name);

            var requestOptions = {
                headers: myHeaders,
                method: 'UPDATE',
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

    const createSurveyBlock = function () {
        setSurveyBlocks(surveyBlocks.concat([[]]));
    }

    const createQuestion = function (id) {
        setSurveyBlocks(surveyBlocks.map((surveyBlock, blockID) => {
            return blockID === id ? surveyBlock.concat("rating") : surveyBlock;
        }));
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

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={() => { userUpdateHandler() }}>Редактировать</Button>
                </Modal.Footer>
            </Modal>

            <div className="tab">
                <button
                    className={`tablinks ${openTab ? 'active' : ''}`}
                    onClick={() => setOpenTab(true)}
                >
                    Добавление/Удаление/Редактирование пользователя
                </button>
                <button
                    className={`tablinks ${!openTab ? 'active' : ''}`}
                    onClick={() => setOpenTab(false)}
                >
                    Добавление/Удаление/Редактирование опроса
                </button>
            </div>

            <div
                className={`tabcontent ${openTab ? 'active' : ''}`}
                onClick={() => setOpenTab(true)}
            >
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
                                console.log(user)
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
                                                    onClick={() => { showModal(user.name, user.login, user.group, user.admin) }}
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
                        <div className="error-message error-top">
                            {/*TODO: INPUT ERRORS */}
                        </div>
                    </form>
                </div>

            </div>

            <div
                className={`tabcontent ${!openTab ? 'active' : ''}`}
                onClick={() => setOpenTab(false)}
            >
                <SurveysTable
                    group={false}
                    access="admin"
                />
                <div className="survey-constructor">
                    <button
                        className={`survey-constructor__create-btn survey-constructor__newsurvey-btn ${createSurvey ? '' : 'active'}`}
                        onClick={() => { setCreateSurvey(true) }}
                    >
                        Создать опрос
                    </button>
                    <form
                        action="http://localhost:8000/admin/survey"
                        method='POST'
                        onSubmit={surveySubmitHandler}
                    >
                        <div className={`survey-constructor__constructor-block ${createSurvey ? 'active' : ''}`}>
                            <div className="survey-constructor__title-inputs">
                                <div className="title-inputs__block"><label htmlFor="" >Период (заголовок):</label><input type="text" name="period" id="" /></div>
                                <div className="title-inputs__block"><label htmlFor="" >Дата начала:</label><input type="date" name="start_date" id="" /></div>
                                <div className="title-inputs__block"><label htmlFor="" >Дата окончания:</label><input type="date" name="end_date" id="" /></div>
                                <div className="title-inputs__block"><label htmlFor="" >Группы:</label><input type="text" name="groups" id="" /></div>
                                <div className="title-inputs__block">
                                    <label htmlFor="" >Описание:</label><textarea name="description" id="" cols="50" rows="5"></textarea>
                                    <label htmlFor="" >Описание по умолчанию:</label><input type="checkbox" name="desc_default" id="" />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="survey-constructor__create-btn add-block"
                                onClick={createSurveyBlock}
                            >
                                Добавить блок
                            </button>
                            {
                                surveyBlocks.map((surveyBlock, id) => {
                                    return (
                                        <div className='survey-constructor__survey-block' key={id}>
                                            <div className='block-title'>
                                                <label>Заголовок (название дисциплины): </label>
                                                <input type="text" name={`title[${id}]`} />
                                                <div className='survey-constructor__question'>
                                                    <button
                                                        className='survey-constructor__create-btn'
                                                        type="button"
                                                        id={id}
                                                        onClick={() => createQuestion(id)}
                                                    >
                                                        Добавить вопрос
                                                    </button>
                                                </div>
                                                {
                                                    surveyBlock.map((question, qid) => {
                                                        return (
                                                            <fieldset key={qid}>
                                                                <div className="question-type">
                                                                    <label>Оценка (от 1 до 5): </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="rating" />
                                                                </div>
                                                                <div className="question-type">
                                                                    <label>Обязательное поле: </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="input" />
                                                                </div>
                                                                <div className="question-type">
                                                                    <label>Необязательное поле: </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="input_imp" />
                                                                </div>
                                                                <textarea className="question-field" name={`qfield[${id}][${qid}]`} cols="30" rows="4" placeholder="Введите вопрос">

                                                                </textarea>
                                                            </fieldset>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            <input
                                type="hidden"
                                name="token"
                                value={token}
                            />
                            <input
                                type="submit"
                                name="newsurvey-submit"
                                className={`send-btn ${surveyBlocks.length ? '' : 'hidden'} send-margin`}
                                value="Создать"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}