import './style.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'

export const ResultGroups = ({ selectedGroup, setSelectedGroup }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [data, setData] = useState([]);

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

            fetch(`http://localhost:8000/results/bygroup?group=${selectedGroup}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    console.log(result);
                    setData(result);
                })
                .catch(error => { navigate('/') });
        }
    }, [token, navigate]);

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    return (
        <>
            <button
                className='return-btn'
                onClick={() => {
                    setSelectedGroup("")
                }}
            >
                &lt;
            </button>
            {
                data.map((survey, key) => {
                    return (
                        <section
                            className="survey-section"
                            key={key}
                        >
                            {`Опрос ${survey.surveyName}`}
                            <br />
                            {
                                survey.surveyQuestions.map((question, i) => {
                                    let rates = [0, 0, 0, 0, 0];
                                    if (question.type === 'rating') {
                                        survey.surveyResults.forEach(surveyRes => {
                                            if (surveyRes[i] !== 'idk') {
                                                rates[parseInt(surveyRes[i]) - 1]++;
                                            }
                                        });

                                        return (
                                            <Bar
                                                key={`${key}-${i}`}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: question.value,
                                                        },
                                                    },
                                                }}
                                                data={
                                                    {
                                                        labels: ['1', '2', '3', '4', '5'],
                                                        datasets: [
                                                            {
                                                                label: '',
                                                                data: rates,
                                                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                                            }
                                                        ]
                                                    }
                                                }
                                            />
                                        )
                                    } else if (question.type === 'input') {
                                        return (
                                            <div
                                                className='section__question'
                                                key={`${key}-${i}`}
                                            >
                                                {`Вопрос: ${question.value}`}
                                                <br />
                                                {`Ответы:`}
                                                {survey.surveyResults.map((surveyRes, s_i) => {
                                                    if (surveyRes[i].replace(/\s|-/g, '') !== '')
                                                        return (
                                                            <div
                                                                className='section__answer'
                                                                key={`${key}-${i}-${s_i}`}
                                                            >
                                                                {surveyRes[i]}
                                                            </div>
                                                        )
                                                })}
                                            </div>
                                        )
                                    }
                                }
                                )
                            }</section>
                    );
                })
            }
        </>
    )
}