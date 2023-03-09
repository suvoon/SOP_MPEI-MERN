import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom'
import { GroupSelector } from '../../components/GroupSelector/GroupSelector';
import { ResultSurveys } from '../../components/ResultSurveys/ResultSurveys';
import { ResultGroups } from '../../components/ResultGroups/ResultGroups';
import './style.css'

export const ResultsPage = () => {
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');

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