import './style.css'

// Компонент контейнера
export const Container = (props) => {

    return (
        <div className='container'>
            {props.children}
        </div>
    )
}