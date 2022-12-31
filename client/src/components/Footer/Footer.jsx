import './style.css'
import { Container } from "../Container/Container"

export const Footer = () => {
    return (
        <div className='footer'>
            <Container>
                <div className="footer__row">
                    <div className="footer__text">СОП. МЭИ, 2022.</div>
                </div>
            </Container>
        </div>
    )
}