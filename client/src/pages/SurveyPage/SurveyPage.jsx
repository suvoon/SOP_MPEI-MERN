import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import './style.css'

// Страница опроса
export const SurveyPage = () => {

    let { surveyID } = useParams();
    const [surveyData, setSurveyData] = useState({});
    const [redirect, setRedirect] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Отправка запроса на получение данных опроса
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

            fetch(`http://localhost:8000/survey?surveyID=${surveyID}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    if (result?.status == 'error') {
                        navigate('/404')
                    } else {
                        setSurveyData(result);
                    }
                })
                .catch(error => { navigate('/404') });
        }
    }, [token, navigate, surveyID]);

    useEffect(() => {
        if (redirect) {
            setRedirect(false);
            navigate('/surveys');
        }
    }, [redirect, navigate]);

    const surveySubmitHandler = function (ev) {
        setRedirect(true);
    };

    return (
        <>
            <div className="intro">
                <h1 className="semester">{surveyData.period}</h1>
                <div className="intro__text">{surveyData.description}</div>
            </div>
            <div className="quiz">
                <form
                    action="http://localhost:8000/survey"
                    method='POST'
                    onSubmit={surveySubmitHandler}
                >
                    {
                        surveyData.content?.map((field, i) => {
                            switch (field.type) {
                                case 'title':
                                    return (
                                        <h3 className="quiz__title" key={i}>{field.value}</h3>
                                    )
                                case 'rating':
                                    return (<div key={i}>
                                        <div className="quiz__block">
                                            <div className="block__header">
                                                <span>1</span>
                                                <span>2</span>
                                                <span>3</span>
                                                <span>4</span>
                                                <span>5</span>
                                                <span>Затрудняюсь ответить</span>
                                            </div>
                                        </div>
                                        <div className="quiz__block">
                                            <fieldset>
                                                <input
                                                    type="radio"
                                                    value="idk"
                                                    name={field.name}
                                                    defaultChecked={true}
                                                    onChange={() => { }}
                                                />
                                                <input type="radio" value="5" name={field.name} />
                                                <input type="radio" value="4" name={field.name} />
                                                <input type="radio" value="3" name={field.name} />
                                                <input type="radio" value="2" name={field.name} />
                                                <input type="radio" value="1" name={field.name} />
                                            </fieldset>
                                            <span>{field.value}</span>
                                        </div>
                                    </div>);
                                case 'input':
                                    return (<div key={i}>
                                        <div className="quiz__block">
                                            <h3>{field.value}</h3>
                                        </div>
                                        <div className="quiz__block quiz__note">
                                            <input type="text" className="text" name={field.name} />
                                        </div>
                                    </div>);
                                case 'input_imp':
                                    return (<div key={i}>
                                        <div className="quiz__block">
                                            <h3>{field.value}</h3>
                                        </div>
                                        <div className="quiz__block quiz__note">
                                            <input type="text" className="text" name={field.name} important="true" />
                                        </div>
                                    </div>);
                                default:

                                    break;
                            }
                            return 0;
                        })
                    }
                    <div className="button-block">
                        <input
                            type="submit"
                            value="Завершить"
                            name="quiz-submit"
                            className="send-btn"
                        />
                    </div>
                    {/* TODO: СДЕЛАТЬ БЕЗОПАСНУЮ ПЕРЕДАЧУ ТОКЕНА И URL */}
                    <input
                        type="hidden"
                        name="token"
                        value={token}
                    />
                    <input
                        type="hidden"
                        name="surveyID"
                        value={surveyID}
                    />
                    {/* TODO: СДЕЛАТЬ БЕЗОПАСНУЮ ПЕРЕДАЧУ ТОКЕНА И URL */}
                </form>
            </div>
        </>
    )
}