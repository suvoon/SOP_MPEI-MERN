import { SurveysTable } from '../../components/SurveysTable/SurveysTable';
import './style.css'

export const SurveysPage = () => {

    return (
        <>
            <div className="intro">
                <h1>Студенческая оценка преподавания</h1>
                <h2>Уважаемые обучающиеся!</h2>
                <div className="intro__text">Вам предстоит принять участие в студенческой оценке качества преподавания. Оценка проводится, чтобы студенты могли выразить свое мнение об организации учебного процесса на своей образовательной программе, высказать предложения по конкретным учебным дисциплинам и оставить комментарии касательно проведения занятий преподавателями. Результаты оценки учитываются руководством институтов.</div>
            </div>
            <SurveysTable
                group={true}
                access="user"
            />
        </>
    )
}