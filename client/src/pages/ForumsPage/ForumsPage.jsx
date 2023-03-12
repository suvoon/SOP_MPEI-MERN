import './style.css'

export const ForumsPage = () => {

    return (
        <>
            <div className="search-block">
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
            </div>
            <nav className="filters-block">
                <div className="filters__category">
                    <span>Категория</span>
                    <div className="category__dropdown">
                        <ul>
                            <li>Важное</li>
                            <li>Заметка</li>
                            <li>Вопрос</li>
                            <li>Обсуждение</li>
                        </ul>
                    </div>
                </div>
                <ul className="filters__sortby">
                    <li>Активные</li>
                    <li>Последние</li>
                </ul>
            </nav>
            <table className="forums-table">
                <tr className='forums-table__header'>
                    <th>Тема</th>
                    <th>Категория</th>
                    <th>Ответы</th>
                </tr>
                <tr className='forums-table__row'>
                    <td>Правила форумов</td>
                    <td>Важное</td>
                    <td>77</td>
                </tr>
            </table>
        </>
    )
}