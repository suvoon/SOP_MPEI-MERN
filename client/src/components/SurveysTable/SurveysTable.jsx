import './style.css'
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'


export const SurveysTable = ({ group, access, selectedSurvey = null, setSelectedSurvey = null }) => {

    const navigate = useNavigate();
    const [surveys, setSurveys] = useState([]);

    const token = localStorage.getItem('token');

    const updateSurveys = () => {
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

            fetch(`http://localhost:8000/surveys?group=${group}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    setSurveys(result);
                })
                .catch(error => { console.log(error) });
        }
    }

    useEffect(updateSurveys, [token, navigate, group]);

    const surveyDeleteHandler = function (id) {
        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("surveyID", id);

            var requestOptions = {
                headers: myHeaders,
                method: 'DELETE',
                body: urlencoded
            };

            fetch("http://localhost:8000/admin/survey", requestOptions)
                .then(response => response.text())
                .then(result => {
                    updateSurveys();
                })
                .catch(error => console.log('error', error));
        }
    };

    return (
        <>
            <div className="surveys">
                {
                    surveys.length
                        ?
                        <table className="surveys__table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>????????????</th>
                                    <th>???????? ????????????</th>
                                    <th>???????? ??????????????????</th>
                                    <th>????????????????</th>
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
                                                <td>
                                                    {
                                                        (() => {
                                                            switch (access) {
                                                                case "admin":
                                                                    return (<>
                                                                        <input
                                                                            type='submit'
                                                                            value='??????????????'
                                                                            name={`delete-survey[${survey._id}]`}
                                                                            className='info-block__button'
                                                                            onClick={() => surveyDeleteHandler(survey._id)}
                                                                        />
                                                                        <input
                                                                            type='button'
                                                                            value='??????????????????????????'
                                                                            name='edituser'
                                                                            className='info-block__button info-block__edit'
                                                                        />
                                                                    </>)
                                                                case "user":
                                                                    return <Link to={`/survey/${survey.link}`}>??????????????????</Link>
                                                                case "results":
                                                                    return (
                                                                        <button onClick={() => setSelectedSurvey(survey._id)}>
                                                                            ??????????????
                                                                        </button>
                                                                    )
                                                                default:
                                                                    return "";
                                                            }
                                                        })()

                                                    }

                                                </td>
                                            </tr>
                                        )
                                    })

                                }
                            </tbody>
                        </table>
                        :
                        <h2>???????? ?????????????? ??????</h2>
                }
            </div>
        </>
    )
}