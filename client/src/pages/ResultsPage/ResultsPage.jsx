import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { GroupSelector } from '../../components/GroupSelector/GroupSelector';
import { ResultSurveys } from '../../components/ResultSurveys/ResultSurveys';
import { ResultGroups } from '../../components/ResultGroups/ResultGroups';
import './style.css'

export const ResultsPage = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');

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

            fetch(`http://localhost:8000/admincheck`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    if (!result) {
                        navigate('/')
                    }
                })
                .catch(error => { navigate('/') });
        }
    }, []);

    return (
        <>
            <Container>
                {
                    selectedGroup
                        ? <ResultGroups
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                        />
                        :
                        selectedSurvey
                            ?
                            <ResultSurveys
                                selectedSurvey={selectedSurvey}
                                setSelectedSurvey={setSelectedSurvey}
                            />
                            :
                            <GroupSelector
                                selectedGroup={selectedGroup}
                                setSelectedGroup={setSelectedGroup}
                                selectedSurvey={selectedSurvey}
                                setSelectedSurvey={setSelectedSurvey}
                            />
                }
            </Container>

        </>
    )
}