import './style.css'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import {
    Button,
    Modal,
    Form,
} from 'react-bootstrap';

export const ForumsPage = () => {

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const categoryDict = ["Важное", "Вопрос", "Обсуждение"];

    const [dropdown, setDropdown] = useState(false);
    const [query, setQuery] = useState('');
    const [topics, setTopics] = useState([]);
    const [sortBy, setSortBy] = useState('Default');
    const [category, setCategory] = useState('All');
    const [isShowModal, setIsShowModal] = useState(false);
    const [status, setStatus] = useState('');
    const [ifAdmin, setIfAdmin] = useState(false);

    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [createCategory, setCreateCategory] = useState('Discussion');

    const closeModal = () => setIsShowModal(false);
    const showModal = () => {
        setIsShowModal(true)
    };

    const updateTopics = function () {
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

            fetch(`http://localhost:8000/forums?topicsquery=${query}&category=${category}&sortby=${sortBy}`,
                requestOptions)
                .then(response => response.json())
                .then(result => {
                    setTopics(result);
                })
                .catch(error => { console.log(error) });
        }
    };

    useEffect(() => {
        updateTopics();
    }, [category, sortBy]);

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

            fetch(`http://localhost:8000/admincheck`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    setIfAdmin(result);
                })
                .catch(error => { navigate('/') });
        }
    }, []);

    const createTopicHandler = function () {
        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("headline", headline);
            urlencoded.append("description", description);
            urlencoded.append("category", createCategory);

            var requestOptions = {
                headers: myHeaders,
                method: 'POST',
                body: urlencoded
            };

            fetch("http://localhost:8000/forums", requestOptions)
                .then(response => response.text())
                .then(result => {
                    setStatus(result);
                    updateTopics();
                    closeModal();
                    setHeadline('');
                    setDescription('');
                    setCreateCategory('');
                })
                .catch(error => console.log('error', error));
        }
    };

    return (
        <>
            <Modal show={isShowModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Создать обсуждение</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>

                        <Form.Group className="mb-3" controlId="formBasicHeadline">
                            <Form.Label>Тема</Form.Label>
                            <Form.Control
                                required
                                type="headline"
                                placeholder="Тема обсуждения"
                                name="headline"
                                value={headline}
                                onChange={ev => { setHeadline(ev.target.value) }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDescription">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                required
                                as="textarea"
                                type="description"
                                placeholder="Описание"
                                name="description"
                                value={description}
                                onChange={ev => { setDescription(ev.target.value) }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDescription">
                            <Form.Label>Категория</Form.Label>
                            <Form.Select
                                required
                                aria-label="Категория"
                                type="description"
                                placeholder="Описание"
                                name="description"
                                value={createCategory}
                                onChange={ev => { setCreateCategory(ev.target.value) }}
                            >
                                <option value="Discussion">Обсуждение</option>
                                <option value="Question">Вопрос</option>
                                {
                                    ifAdmin
                                        ? <option value="Important">Важное</option>
                                        : ''
                                }
                            </Form.Select>
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={() => { createTopicHandler() }}>Создать</Button>
                </Modal.Footer>
            </Modal>
            <div className={`forum__error-message ${status !== 'Обсуждение успешно создано' ? 'error' : ''}`}>{status}</div>
            <form
                className="search-block"
                onSubmit={(ev) => {
                    ev.preventDefault();
                    updateTopics();
                }}
            >
                <div className="mglass-container">

                    <button type="button">
                        <img
                            src="/images/mglass-favicon.png"
                            alt="поиск"
                        />
                    </button>
                </div>
                <input
                    type="text"
                    placeholder='Ключевые слова'
                    onChange={ev => { setQuery(ev.target.value) }}
                />
            </form>
            <nav className="filters-block">
                <div className={`filters__category ${dropdown ? 'filters__category_active' : ''}`}>
                    <button type='button' onClick={() => { setDropdown(!dropdown) }}>Категория</button>
                    <div className={`category__dropdown ${dropdown ? 'category__dropdown_visible' : ''}`}>
                        <ul>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'All' ? 'active' : ''}
                                    onClick={() => { setCategory('All'); setDropdown(false) }}
                                >
                                    Всё
                                </button>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'Important' ? 'active' : ''}
                                    onClick={() => { setCategory(0); setDropdown(false) }}
                                >
                                    Важное
                                </button>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'Question' ? 'active' : ''}
                                    onClick={() => { setCategory(1); setDropdown(false) }}
                                >
                                    Вопрос
                                </button>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'Discussion' ? 'active' : ''}
                                    onClick={() => { setCategory(2); setDropdown(false) }}
                                >
                                    Обсуждение
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <ul className="filters__sortby">
                    <li>
                        <button
                            type="button"
                            className={sortBy === 'Default' ? 'active' : ''}
                            onClick={() => { setSortBy('Default') }}
                        >
                            По умолчанию
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className={sortBy === 'Relevant' ? 'active' : ''}
                            onClick={() => { setSortBy('Relevant') }}
                        >
                            Активные
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className={sortBy === 'Latest' ? 'active' : ''}
                            onClick={() => { setSortBy('Latest') }}
                        >
                            Последние
                        </button>
                    </li>
                </ul>
                <button
                    className="filters__create"
                    onClick={() => { showModal() }}
                >
                    Создать
                </button>
            </nav>
            <table className="forums-table">
                <thead>
                    <tr className='forums-table__header'>
                        <th>Тема</th>
                        <th>Категория</th>
                        <th>Ответы</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        topics.map((topic, i) => {
                            return (
                                <tr key={i} className={`forums-table__row background-${topic.category}`} >
                                    <td>
                                        <Link
                                            to={`/forum/${topic.link}`}
                                            className='topic-link'
                                        >
                                            {topic.headline.slice(0, 100)}
                                        </Link>
                                    </td>
                                    <td>{categoryDict[topic.category]}</td>
                                    <td>{topic.comments}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>

            </table>
        </>
    )
}