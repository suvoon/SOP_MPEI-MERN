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

export const ResultSurveys = ({ selectedSurvey, setSelectedSurvey }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [data, setData] = useState([['']]);
    let qCounter = 0;

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

            fetch(`http://localhost:8000/results/bysurvey?survey=${selectedSurvey}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    console.log(result, "result");
                    result[0].qCounter = 0;
                    setData(result);
                })
                .catch(error => { navigate('/') });
        }
    }, [token, navigate]);

    useEffect(() => { qCounter = 0 }, [data]);

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
                    setSelectedSurvey("")
                }}
            >
                &lt;
            </button>
            Опрос {data[0].period ?? ''}
            {
                data[0].content?.map((question, key) => {
                    const dataByGroups = data[0].groups?.map(group => {
                        return {
                            group,
                            results: data[1]?.filter(result => result.group === group).map(res => res.questions)
                        }
                    });
                    switch (question.type) {
                        case 'title':
                            return (
                                <h2>{question.value}</h2>
                            )
                        case 'rating':
                            const datasets = dataByGroups.map(groupedResult => {
                                let rates = [0, 0, 0, 0, 0];
                                groupedResult.results.forEach(res => {
                                    if (res[qCounter] !== 'idk') {
                                        rates[parseInt(res[qCounter]) - 1]++;
                                    }
                                })
                                return {
                                    label: groupedResult.group,
                                    data: rates,
                                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                                }
                            });
                            qCounter++;
                            return (
                                <Bar
                                    key={key}
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
                                            datasets
                                        }
                                    }
                                />
                            )
                        case 'input':
                            qCounter++;
                            return (
                                <div className='question-block'>
                                    {`Вопрос: ${question.value}`}
                                    <br />
                                    Ответы: <br />
                                    {dataByGroups.map(groupedResult => {
                                        console.log(groupedResult)
                                        return groupedResult.results.map(res => {
                                            if (res[qCounter - 1].replace(/\s|-/g, '') !== '') {
                                                return (
                                                    <div className='answer-block'>
                                                        {res[qCounter - 1]}
                                                    </div>
                                                )
                                            }
                                        })
                                    })}
                                </div>
                            )
                        case 'input_imp':
                            qCounter++;
                            return (
                                <div className='question-block'>
                                    {`Вопрос: ${question.value}`}
                                    <br />
                                    Ответы: <br />
                                    {dataByGroups.map(groupedResult => {
                                        console.log(groupedResult)
                                        return groupedResult.results.map(res => {
                                            if (res[qCounter - 1].replace(/\s|-/g, '') !== '') {
                                                return (
                                                    <div className='answer-block'>
                                                        {res[qCounter - 1]}
                                                    </div>
                                                )
                                            }
                                        })
                                    })}
                                </div>
                            )
                        default:
                            return '';
                    }
                })
            }
        </>
    )
}