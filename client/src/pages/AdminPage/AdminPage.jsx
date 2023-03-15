import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './style.css'
import { AdminUser } from '../../components/AdminUser/AdminUser';
import { AdminSurvey } from '../../components/AdminSurvey/AdminSurvey';

export const AdminPage = () => {

    const navigate = useNavigate();
    const [openTab, setOpenTab] = useState(true);

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

            <div className="tab">
                <button
                    className={`tablinks ${openTab ? 'active' : ''}`}
                    onClick={() => setOpenTab(true)}
                >
                    Добавление/Удаление/Редактирование пользователя
                </button>
                <button
                    className={`tablinks ${!openTab ? 'active' : ''}`}
                    onClick={() => setOpenTab(false)}
                >
                    Добавление/Удаление/Редактирование опроса
                </button>
            </div>

            <div
                className={`tabcontent ${openTab ? 'active' : ''}`}
                onClick={() => setOpenTab(true)}
            >
                <AdminUser />
            </div>

            <div
                className={`tabcontent ${!openTab ? 'active' : ''}`}
                onClick={() => setOpenTab(false)}
            >
                <AdminSurvey />
            </div>
        </>
    )
}