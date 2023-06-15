const encodeID = require('encodeID')();
const replaceDisallowedWords = require('disallowed-word-filter');

const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function createComment(req, res, next) {
    try {

        // Получение тела комментария и идентификатора форума из тела запроса
        let { reply, forum_id } = req.body;
        reply = reply.slice(0, 200);

        const myFilter = new replaceDisallowedWords({
            additionalWords: 'ъъъ'
        });

        // Проверка на допустимость
        if (reply.length < 4) res.send('Слишком короткое сообщение')
        else if (myFilter.check(reply, true)) res.send('Сообщение содержит недопустимые слова')
        else {

            // Получение схемы и аутентификация по токену
            let { dbTopics, dbComments } = getSchemas();
            const { auth, user } = authorize(false, req.headers.authorization);

            if (!auth) res.status(401).send('Unauthorized request');
            else {

                const decodedID = encodeID.decode(forum_id);

                // Создание новой записи комментария в БД
                await dbComments.create(
                    {
                        topic_id: decodedID,
                        text: reply,
                        date: new Date(),
                        author: user.name,
                        author_id: user.id
                    })
                    .then((result) => {
                        return dbTopics
                            .updateOne(
                                { _id: decodedID },
                                { $inc: { comments: 1 } },
                            )
                        //res.redirect(`localhost:3000/`);
                    })
                    .then(result => res.send(''))
            }
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function getComments(req, res, next) {
    try {

        // Получение идентификатора форума из параметра запроса
        const forumID = req.query.forumID;

        // Получение схем и аутентификация по токену
        let { dbTopics, dbComments } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const decodedID = encodeID.decode(forumID);

            // Получение обсуждения по идентиффикатору
            const topics = await dbTopics
                .find({
                    _id: decodedID
                })
                .select({ headline: 1, description: 1, date: 1, author: 1, comments: 1 });

            // Получение комментариев найденного обсуждения
            await dbComments
                .find({
                    topic_id: decodedID
                })
                .select({ text: 1, date: 1, author: 1, author_id: 1 })
                .then(comments => {
                    res.json({
                        topic: topics[0],
                        comments
                    });
                })
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function deleteComment(req, res, next) {
    try {
        // Получение идентификатора комментария и идентификатора форума из тела запроса
        let { comment_id, forum_id } = req.body;

        // Получение схем и аутентификация по токену
        let { dbTopics, dbComments, dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const decodedID = encodeID.decode(forum_id);

            // Проверка прав администратора пользователя
            await dbUsers.find({ _id: user.id })
                .then(docs => {
                    if (!docs[0] || !docs[0].admin) throw new Error('Deleting comments: No access');
                    return dbComments.deleteOne({ _id: comment_id });
                })
                .then(result => {
                    return dbTopics.updateOne(
                        { _id: decodedID },
                        { $inc: { comments: -1 } },
                    )
                })
                .then(result => res.send('OK'))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { createComment, getComments, deleteComment };