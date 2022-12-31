import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import './style.css'

export const SurveysPage = () => {

    const navigate = useNavigate();
    const [surveys, setSurveys] = useState([]);

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

            fetch("http://localhost:8000/surveys", requestOptions)
                .then(response => response.json())
                .then(result => {
                    setSurveys(result);
                })
                .catch(error => { navigate('/') });
        }
    }, [token, navigate]);

    return (
        <>
            <div className="intro">
                <h1>Студенческая оценка преподавания</h1>
                <h2>Уважаемые обучающиеся!</h2>
                <div className="intro__text">Вам предстоит принять участие в студенческой оценке качества преподавания. Оценка проводится, чтобы студенты могли выразить свое мнение об организации учебного процесса на своей образовательной программе, высказать предложения по конкретным учебным дисциплинам и оставить комментарии касательно проведения занятий преподавателями. Результаты оценки учитываются руководством институтов.</div>
            </div>
            <div className="surveys">
                {
                    surveys.length
                        ?
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
                                                <td><Link to={`/survey/${survey.link}`}>Выполнить</Link></td>
                                            </tr>
                                        )
                                    })

                                }
                            </tbody>
                        </table>
                        :
                        <h2>Пока опросов нет</h2>
                }
            </div>
        </>
    )
}