import './style.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Modal,
    Form
} from 'react-bootstrap';

export const ForumsPage = () => {

    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);
    const [query, setQuery] = useState('');
    const [topics, setTopics] = useState([]);
    const [sortBy, setSortBy] = useState('Default');
    const [category, setCategory] = useState('All');
    const [isShowModal, setIsShowModal] = useState(false);

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

            fetch(`http://localhost:8000/forums?query=${query}&category=${category}&sortby=${sortBy}`,
                requestOptions)
                .then(response => response.json())
                .then(result => {
                    setTopics(result);
                })
                .catch(error => { console.log(error) });
        }
    };

    useEffect(() => {

    }, [category, sortBy])

    return (
        <>
            <Modal show={isShowModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Создать обсуждение</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Тема</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Новый пароль"
                                name="password"
                                value={''}
                                onChange={ev => { }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicGroup">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                type="group"
                                placeholder="Группа"
                                name="group"
                                value={''}
                                onChange={ev => { }}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={() => { }}>Создать</Button>
                </Modal.Footer>
            </Modal>
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
                                    onClick={() => { setCategory('Important'); setDropdown(false) }}
                                >
                                    Важное
                                </button>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'Question' ? 'active' : ''}
                                    onClick={() => { setCategory('Question'); setDropdown(false) }}
                                >
                                    Вопрос
                                </button>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    className={category === 'Discussion' ? 'active' : ''}
                                    onClick={() => { setCategory('Discussion'); setDropdown(false) }}
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
                            className={sortBy === 'Active' ? 'active' : ''}
                            onClick={() => { setSortBy('Active') }}
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
                    <tr className='forums-table__row'>
                        <td>Правила форумов</td>
                        <td>Важное</td>
                        <td>77</td>
                    </tr>
                </tbody>

            </table>
        </>
    )
}