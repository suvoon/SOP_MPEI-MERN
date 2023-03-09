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
                    console.log(result[1]);
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

    useEffect(() => {
        data[0]?.groups?.map(group => {
            return data[1]?.filter(result => result[1] === group)
        });
    }, [data])

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
            Опрос {data[0][0]}
            {
                data[1]?.map(result => {
                    return result
                })
            }
        </>
    )
}