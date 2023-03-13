import './style.css'
import { useState } from 'react'

export const ForumsPage = () => {

    const [dropdown, setDropdown] = useState(false);

    return (
        <>
            <form className="search-block">
                <div className="mglass-container">

                    <button type="button">
                        <img
                            src="/images/mglass-favicon.png"
                            alt="поиск"
                        />
                    </button>
                </div>
                <input
                    type="text"
                    placeholder='Ключевые слова'
                />
            </form>
            <nav className="filters-block">
                <div className={`filters__category ${dropdown ? 'filters__category_active' : ''}`}>
                    <button type='button' onClick={() => { setDropdown(!dropdown) }}>Категория</button>
                    <div className={`category__dropdown ${dropdown ? 'category__dropdown_visible' : ''}`}>
                        <ul>
                            <li><button type='button'>Важное</button></li>
                            <li><button type='button'>Заметка</button></li>
                            <li><button type='button'>Вопрос</button></li>
                            <li><button type='button'>Обсуждение</button></li>
                        </ul>
                    </div>
                </div>
                <ul className="filters__sortby">
                    <li>Активные</li>
                    <li>Последние</li>
                </ul>
            </nav>
            <table className="forums-table">
                <thead>
                    <tr className='forums-table__header'>
                        <th>Тема</th>
                        <th>Категория</th>
                        <th>Ответы</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='forums-table__row'>
                        <td>Правила форумов</td>
                        <td>Важное</td>
                        <td>77</td>
                    </tr>
                </tbody>

            </table>
        </>
    )
}