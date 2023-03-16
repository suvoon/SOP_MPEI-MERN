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
    const [view, setView] = useState('Diagram');
    let qCounter = 0;
    let groupColors = [];

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

    useEffect(() => {
        qCounter = 0;
    }, [data]);

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
            <h2>Опрос {data[0].period ?? ''}</h2>
            <div className="result-view">Отображение результатов:</div>
            <div className="result-view__buttons">
                <button
                    className={`result-view__diagrams ${view === 'Diagram' ? 'active' : ''}`}
                    onClick={() => { setView('Diagram') }}
                >
                    В виде диаграмм
                </button>
                <button
                    className={`result-view__tables ${view === 'Table' ? 'active' : ''}`}
                    onClick={() => { setView('Table') }}
                >
                    В виде таблиц
                </button>
            </div>
            {
                view === 'Diagram'
                    ?
                    <>
                        {
                            data[0].groups?.map((group, i) => {
                                groupColors[i] = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
                            })
                        }
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
                                            <h4 key={key}>{question.value}</h4>
                                        )
                                    case 'rating':
                                        const datasets = dataByGroups.map((groupedResult, group_i) => {
                                            let rates = [0, 0, 0, 0, 0];
                                            groupedResult.results.forEach(res => {
                                                if (res[qCounter] !== 'idk') {
                                                    rates[parseInt(res[qCounter]) - 1]++;
                                                }
                                            })
                                            return {
                                                label: groupedResult.group,
                                                data: rates,
                                                backgroundColor: groupColors[group_i]
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
                    :
                    <>
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
                                            <h4 key={key}>{question.value}</h4>
                                        )
                                    case 'rating':
                                        const datasets = dataByGroups.map((groupedResult, group_i) => {
                                            let rates = [0, 0, 0, 0, 0];
                                            groupedResult.results.forEach(res => {
                                                if (res[qCounter] !== 'idk') {
                                                    rates[parseInt(res[qCounter]) - 1]++;
                                                }
                                            })
                                            return {
                                                group: groupedResult.group,
                                                data: rates,
                                                backgroundColor: groupColors[group_i]
                                            }
                                        });
                                        qCounter++;
                                        let totals = [0, 0, 0, 0, 0, 0];
                                        datasets.forEach(dataset => {
                                            for (let j = 0; j < 5; j++) {
                                                totals[j] += dataset.data[j];
                                                totals[5] += dataset.data[j];
                                            }
                                        });

                                        return (
                                            <>
                                                <h5 className='table-value'>{question.value}</h5>
                                                <table className="results-table" key={key}>
                                                    <thead>
                                                        <tr>
                                                            <th>Группа</th>
                                                            <th>1</th>
                                                            <th>2</th>
                                                            <th>3</th>
                                                            <th>4</th>
                                                            <th>5</th>
                                                            <th>Средний балл</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            datasets.map((dataset) => {
                                                                const totalVotes = dataset.data.reduce((prev, curr) => {
                                                                    return prev += curr;
                                                                }, 0);
                                                                const averageVote = dataset.data.reduce((prev, curr, i) => {
                                                                    return prev += (i + 1) * curr;
                                                                }, 0) / (totalVotes || 1);
                                                                return (
                                                                    <>
                                                                        <tr>
                                                                            <td>{dataset.group}</td>
                                                                            <td>{dataset.data[0]}</td>
                                                                            <td>{dataset.data[1]}</td>
                                                                            <td>{dataset.data[2]}</td>
                                                                            <td>{dataset.data[3]}</td>
                                                                            <td>{dataset.data[4]}</td>
                                                                            <td>{averageVote || 'Нет голосов'}</td>
                                                                        </tr>
                                                                    </>
                                                                )
                                                            })
                                                        }
                                                        <tr>
                                                            <td>Итог:</td>
                                                            <td>{totals[0]}</td>
                                                            <td>{totals[1]}</td>
                                                            <td>{totals[2]}</td>
                                                            <td>{totals[3]}</td>
                                                            <td>{totals[4]}</td>
                                                            <td>
                                                                {totals.reduce((prev, curr, i) => {
                                                                    return prev += i == 5 ? 0 : (i + 1) * curr;
                                                                }, 0) / (totals[5] || 1) || 'Нет голосов'}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </>
                                        )
                                    case 'input':
                                        qCounter++;
                                        return (
                                            <div className='question-block'>
                                                {`Вопрос: ${question.value}`}
                                                <br />
                                                Ответы: <br />
                                                {dataByGroups.map(groupedResult => {
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
            }

        </>
    )
}