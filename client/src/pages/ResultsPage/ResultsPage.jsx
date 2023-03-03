import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom'
import { GroupSelector } from '../../components/GroupSelector/GroupSelector';
import { SurveySelector } from '../../components/SurveySelector/SurveySelector';
import { ResultGraphs } from '../../components/ResultGraphs/ResultGraphs';
import './style.css'

export const ResultsPage = () => {
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');

    return (
        <>
            <Container>
                {
                    selectedGroup
                        ? <ResultGraphs
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                        />
                        :
                        selectedSurvey
                            ?
                            <SurveySelector
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