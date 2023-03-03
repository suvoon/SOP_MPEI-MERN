import './style.css'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { SurveysTable } from '../SurveysTable/SurveysTable';


export const GroupSelector = ({ selectedGroup, setSelectedGroup, selectedSurvey, setSelectedSurvey }) => {
    const [groups, setGroups] = useState([]);

    const navigate = useNavigate();
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

            fetch(`http://localhost:8000/groups`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    setGroups(result);
                })
                .catch(error => { navigate('/') });
        }
    }, [token, navigate]);

    return (
        <>
            <h2>Выберите группу:</h2>
            <div className='group-buttons'>
                {
                    groups.map((group, i) => {
                        return (
                            <button key={i} onClick={() => setSelectedGroup(group[0])}>
                                {group[0]}
                            </button>
                        )
                    })
                }
            </div>
            <h2>Или выберите опрос:</h2>
            <SurveysTable
                group={false}
                access="results"
                selectedSurvey={selectedSurvey}
                setSelectedSurvey={setSelectedSurvey}
            />
        </>
    )
}