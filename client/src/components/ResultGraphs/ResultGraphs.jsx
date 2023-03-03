import './style.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';

export const ResultGraphs = ({ selectedGroup, setSelectedGroup }) => {

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

            }
        </>
    )
}