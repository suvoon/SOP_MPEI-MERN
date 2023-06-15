const replaceDisallowedWords = require('disallowed-word-filter');
const encodeID = require('encodeID')();
const mongoose = require('mongoose');

const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getForums(req, res, next) {
    try {
        // Получение поискового запроса, категории и фильтра сортировки из параметров запроса
        const { topicsquery, category, sortby } = req.query;

        // Получение схемы и аутентификация по токену
        let { dbTopics } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const searchQuery = {
                'headline': { $regex: topicsquery, $options: "i" }
            };
            category !== 'All' ? searchQuery['category'] = category : true;
            let sortQuery;
            switch (sortby) {
                case 'Relevant':
                    sortQuery = { comments: -1 }
                    break;
                case 'Latest':
                    sortQuery = { date: -1 }
                    break;
                default:
                    sortQuery = { category: 1 }
            }

            // Поиск обсуждений по параметрам
            await dbTopics
                .find(searchQuery)
                .sort(sortQuery)
                .select({ headline: 1, category: 1, comments: 1, link: 1 })
                .then(topics => { res.send(topics ?? []) })
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function createForum(req, res, next) {
    try {
        // Получение заголовка, описания и категории из тела запроса
        let { headline, description, category } = req.body;
        switch (category) {
            case 'Important':
                category = 0;
                break;
            case 'Question':
                category = 1;
                break;
            default:
                category = 2;
        }
        description = description.slice(0, 1000);
        headline = headline.slice(0, 100);

        const myFilter = new replaceDisallowedWords({
            additionalWords: 'ъъъ'
        });

        // Проверка на допустимость
        if (headline.length < 4) res.send('Слишком короткое название темы')
        else if (description.length < 10) res.send('Слишком короткое описание вопроса')
        else if (myFilter.check(headline, true) || myFilter.check(description, true)) res.send('Тема/заголовок содержит недопустимые слова')
        else {

            // Получение схемы и аутентификация по токену
            let { dbTopics } = getSchemas();
            const { auth, user } = authorize(false, req.headers.authorization);

            if (!auth) res.status(401).send('Unauthorized request');
            else {
                const _id = mongoose.Types.ObjectId();
                const link = encodeID.encode(_id.valueOf());

                // Создание нового обсуждения
                await dbTopics.create(
                    {
                        _id,
                        headline,
                        description,
                        category,
                        link,
                        date: new Date(),
                        author: user.name,
                        author_id: user.id,
                        comments: 0,
                    })
                    .then(result => res.send('Обсуждение успешно создано'))
            }
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function deleteForum(req, res, next) {
    try {

        // Получение идентификатора форума из тела запроса
        let { forum_id } = req.body;

        // Получение схем и аутентификация по токену
        let { dbTopics, dbComments, dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const decodedID = encodeID.decode(forum_id);

            // Проверка на права администратора с последующим удалением обсуждения с его комментариями
            await dbUsers.find({ _id: user.id })
                .then(docs => {
                    if (!docs[0] || !docs[0].admin) throw new Error('Deleting topics: No access');
                    return dbTopics.deleteOne({ _id: decodedID });
                })
                .then(result => dbComments.deleteMany({ topic_id: decodedID }))
                .then(result => res.send("OK"))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { getForums, createForum, deleteForum };