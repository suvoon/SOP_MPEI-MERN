import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { SurveysTable } from '../../components/SurveysTable/SurveysTable';
import {
    Button,
    Modal,
    Form
} from 'react-bootstrap';
import './style.css'

export const AdminSurvey = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [surveyPeriod, setSurveyPeriod] = useState('');
    const [surveyStartDate, setSurveyStartDate] = useState('');
    const [surveyEndDate, setSurveyEndDate] = useState('');
    const [surveyDescription, setSurveyDescription] = useState('');
    const [surveyID, setSurveyID] = useState('');

    const [createSurvey, setCreateSurvey] = useState(false);
    const [surveyBlocks, setSurveyBlocks] = useState([]);
    const [redirect, setRedirect] = useState(false);

    const [status, setStatus] = useState('');
    const [isShowModal, setIsShowModal] = useState(false);

    const closeModal = () => setIsShowModal(false);

    useEffect(() => {
        if (redirect) {
            setRedirect(false);
            navigate('/');
        }
    }, [redirect, navigate]);

    const surveySubmitHandler = function (ev) {
        setRedirect(true);
    };

    const surveyUpdateHandler = function () {
        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("period", surveyPeriod);
            urlencoded.append("startdate", surveyStartDate);
            urlencoded.append("enddate", surveyEndDate);
            urlencoded.append("description", surveyDescription);
            urlencoded.append("surveyID", surveyID);

            var requestOptions = {
                headers: myHeaders,
                method: 'PUT',
                body: urlencoded
            };

            fetch("http://localhost:8000/admin/survey", requestOptions)
                .then(response => response.text())
                .then(result => {
                    setStatus(result);
                    closeModal();
                })
                .catch(error => console.log('error', error));
        }
    };

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

                        <Form.Group className="mb-3" controlId="formBasicPeriod">
                            <Form.Label>Период</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Период"
                                value={surveyPeriod}
                                onChange={ev => setSurveyPeriod(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicStartDate">
                            <Form.Label>Дата начала</Form.Label>
                            <Form.Control
                                type="date"
                                name="startdate"
                                value={surveyStartDate}
                                onChange={ev => setSurveyStartDate(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEndDate">
                            <Form.Label>Дата окончания</Form.Label>
                            <Form.Control
                                type="date"
                                name="enddate"
                                value={surveyEndDate}
                                onChange={ev => setSurveyEndDate(ev.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicDesc">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                type="description"
                                placeholder="Описание"
                                name="description"
                                value={surveyDescription}
                                onChange={ev => setSurveyDescription(ev.target.value)}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Закрыть</Button>
                    <Button variant="primary" onClick={() => { surveyUpdateHandler() }}>Редактировать</Button>
                </Modal.Footer>
            </Modal>

            <SurveysTable
                group={false}
                access="admin"
                setSurveyPeriod={setSurveyPeriod}
                setSurveyStartDate={setSurveyStartDate}
                setSurveyEndDate={setSurveyEndDate}
                setSurveyDescription={setSurveyDescription}
                setIsShowModal={setIsShowModal}
                setSurveyID={setSurveyID}
                status={status}
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
        </>
    )
}