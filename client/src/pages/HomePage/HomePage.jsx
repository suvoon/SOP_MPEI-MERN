import { useEffect } from 'react';
import './style.css'

// Домашняя страница системы
export const HomePage = () => {

    const status = window.location.search.split('=')[1];

    if (status === "wrongdate") {
        alert("Некорректная дата начала/окончания опроса")
    } else if (status === "success") {
        alert("Опрос создан успешно")
    }

    return (
        <>
            <div className="intro">
                <h1 className="centered">Портал студенческой оценки преподавания МЭИ</h1>
                <h2 className="centered">Добро пожаловать!</h2>
                <div className="intro__text">Московский энергетический институт сегодня - один из крупнейших технических университетов России в области энергетики, электротехники, электроники, информатики.

                    МЭИ готовит инженерные и научные кадры для иностранных государств начиная с 1946 года.

                    В настоящее время в МЭИ обучаются студенты и аспиранты из 68 стран мира.

                    За успехи в подготовке инженеров и научных кадров награжден двумя государственными орденами и шестью орденами зарубежных государств.

                    МЭИ является постоянным членом Международной ассоциации университетов, Международной ассоциации непрерывного образования, Международного компьютерного клуба и Международной ассоциации энергетиков.</div>
            </div>
            <div className="main-image">
                <img src="/images/mpei_main.jpg" alt="МЭИ" />
            </div>
        </>
    )
}