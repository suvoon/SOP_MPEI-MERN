import './style.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';

export const SurveySelector = ({ selectedSurvey, setSelectedSurvey }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [data, setData] = useState([]);

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
            SURVEYS
        </>
    )
}