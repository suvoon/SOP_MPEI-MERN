import './style.css'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    Modal,
    Form,
} from 'react-bootstrap';

export const ForumPage = () => {

    let { forumID } = useParams();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [forumData, setForumData] = useState({});
    const [replyText, setReplyText] = useState('');

    const updateData = function () {
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

            fetch(`http://localhost:8000/forum?forumID=${forumID}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    setForumData(result);
                })
                .catch(error => { navigate('/') });
        }
    };

    useEffect(updateData, [token, navigate, forumID]);

    const commentAddHandler = function () {
        if (!token) {
            navigate('/');
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("Authorization", `Bearer ${token}`);

            let urlencoded = new URLSearchParams();
            urlencoded.append("reply", replyText);
            urlencoded.append("forum_id", forumID);

            var requestOptions = {
                headers: myHeaders,
                method: 'POST',
                body: urlencoded
            };

            fetch("http://localhost:8000/forum", requestOptions)
                .then(response => response.text())
                .then(result => {
                    updateData();
                    //setStatus(result);
                })
                .catch(error => console.log('error', error));
        }
    }

    return (
        <main className='forum'>
            <header className='forum__headline'>
                {forumData?.topic?.headline}
            </header>
            <div className="forum__post">
                <span className="post__username">
                    {forumData?.topic?.author}
                </span>
                <span className="post__data">
                    {forumData?.topic?.date?.replace(/(\d{4})-(\d{2})-(\d{2}).*/g, "$2.$3.$1")}
                </span>
                <div className="post__description">
                    {forumData?.topic?.description}
                </div>
            </div>
            <Form>

                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Control
                        required
                        as="textarea"
                        type="description"
                        placeholder="Напишите здесь, чтобы ответить..."
                        name="description"
                        className='forum__reply-field'
                        value={replyText}
                        onChange={ev => { setReplyText(ev.target.value) }}
                    />
                    <Button variant="primary" onClick={() => { commentAddHandler() }}>Опубликовать комментарий</Button>
                </Form.Group>

            </Form>

            <div className="forum__comment-number">
                {`${forumData?.topic?.comments} комментариев`}
            </div>

            <div className="forum__comments-block">
                {
                    forumData.comments?.map(comment => {
                        console.log(comment)
                        return (
                            <div className='comments-block__item'>
                                <span className="comments-block__author">{comment.author}</span>
                                <span className="comments-block__date">{comment.date.replace(/(\d{4})-(\d{2})-(\d{2}).*/g, "$2.$3.$1")}</span>
                                <div className="comments-block__text">{comment.text}</div>
                            </div>
                        )
                    })
                }
            </div>

        </main>
    )
}