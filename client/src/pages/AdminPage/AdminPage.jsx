import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
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
    const [status, setStatus] = useState('');

    const [surveys, setSurveys] = useState([]);
    const [createSurvey, setCreateSurvey] = useState(false);
    const [surveyBlocks, setSurveyBlocks] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
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

            fetch("http://localhost:8000/admin/survey", requestOptions)
                .then(response => response.json())
                .then(result => {
                    setSurveys(result);
                })
                .catch(error => { console.log(error) });
        }
    }, [token, navigate]);

    //TODO: useEffect admin check

    const searchSubmitHandler = function (ev) {
        ev.preventDefault();

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
                .then(result => setStatus(result))
                .catch(error => console.log('error', error));
        }

    }

    const surveyAddHandler = function (ev) {
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
                .then(result => setStatus(result))
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
                                type="submit"
                                name="admin-usersubmit"
                                value="Найти"
                                className="admin-querybtn"
                                onClick={searchSubmitHandler}
                            />
                        </form>
                    </div>

                    <div className="admin-query">
                        {
                            users.map((user, i) => {
                                return (
                                    <div class='admin-query__info-block' key={i}>
                                        <div class='info-block__name underline'>
                                            {`${user.name} (${user.login})`}
                                        </div>
                                        <div class='info-block__delete'>
                                            <form action='' method='post'>
                                                <input type='submit' value='Удалить' name={`delete-user[${user._id}]`} class='info-block__button' />
                                                <input type='button' value='Редактировать' name='edituser' class='info-block__button info-block__edit' />
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
                <div className="surveys">
                    <h2>Текущие опросы</h2>
                    <table className="surveys__table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Период</th>
                                <th>Дата начала</th>
                                <th>Дата окончания</th>
                                <th>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                surveys.map((survey, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{survey.period}</td>
                                            <td>{new Date(survey.start_date).toLocaleDateString()}</td>
                                            <td>{new Date(survey.end_date).toLocaleDateString()}</td>
                                            <td><input type='submit' value='Удалить' name={`delete-survey[${survey._id}]`} class='info-block__button' />
                                                <input type='button' value='Редактировать' name='edituser' class='info-block__button info-block__edit' /></td>
                                        </tr>
                                    )
                                })

                            }
                        </tbody>
                    </table>
                </div>
                <div className="survey-constructor">
                    <button
                        className={`survey-constructor__create-btn survey-constructor__newsurvey-btn ${createSurvey ? '' : 'active'}`}
                        onClick={() => { setCreateSurvey(true) }}
                    >
                        Создать опрос
                    </button>
                    <form method="post">
                        <div className={`survey-constructor__constructor-block ${createSurvey ? 'active' : ''}`}>
                            <div className="survey-constructor__title-inputs">
                                <div className="title-inputs__block"><label htmlFor="" >Период (заголовок):</label><input type="text" name="period" id="" /></div>
                                <div className="title-inputs__block"><label htmlFor="" >Дата начала:</label><input type="date" name="startdate" id="" /></div>
                                <div className="title-inputs__block"><label htmlFor="" >Дата окончания:</label><input type="date" name="enddate" id="" /></div>
                                <div className="title-inputs__block">
                                    <label htmlFor="" >Описание:</label><textarea name="description" id="" cols="50" rows="5"></textarea>
                                    <label htmlFor="" >Описание по умолчанию:</label><input type="checkbox" name="desc-default" id="" />
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
                                                <input type="text" />
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
                                                                <div class="question-type">
                                                                    <label>Оценка (от 1 до 5): </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="rate" />
                                                                </div>
                                                                <div class="question-type">
                                                                    <label>Обязательное поле: </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="important" />
                                                                </div>
                                                                <div class="question-type">
                                                                    <label>Необязательное поле: </label>
                                                                    <input type="radio" name={`question[${id}][${qid}]`} value="unimportant" />
                                                                </div>
                                                                <textarea class="question-field" name={`qfield[${id}][${qid}]`} cols="30" rows="4" placeholder="Введите вопрос">

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