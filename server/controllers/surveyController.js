const encodeID = require('encodeID')();

const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getSurvey(req, res, next) {
    try {
        // Получение идентификатора опроса из тела запроса
        const surveyID = req.query.surveyID;

        // Получение схемы и аутентификация по токену
        const { auth, user } = authorize(false, req.headers.authorization);
        let { dbSurveys } = getSchemas();

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const decodedID = encodeID.decode(surveyID);
            await dbSurveys
                .find({
                    _id: decodedID,
                    groups: { $in: [user.group] },
                    completed: { $nin: [user.id] }
                })
                .select({ period: 1, description: 1, content: 1 })
                .then(surveys => res.json(surveys[0]))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок с кодом 404
        err.status = 404;
        next(err);
    }
}

async function postSurvey(req, res, next) {
    try {
        // Получение идентификатора опроса из тела запроса
        const surveyID = req.body.surveyID;

        // Получение схемы и аутентификация по токену
        let { dbSurveys, dbResults } = getSchemas();
        const { auth, user } = authorize(true, req.body.token);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            const decodedID = encodeID.decode(surveyID);

            // Добавление пользователя в список прошедших опрос
            await dbSurveys
                .updateOne(
                    { _id: decodedID },
                    { $push: { completed: user.login } }
                );

            // Фильтрация вопросов (без заголовков) 
            let questions = [];
            for (field in req.body) {
                if (field.includes('question')) {
                    questions.push(req.body[field]);
                }
            };

            // Создание записи результата
            await dbResults.create(
                {
                    login: user.login,
                    group: user.group,
                    survey_id: decodedID,
                    questions: questions
                }
            );
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок с кодом 404
        err.status = 404;
        next(err);
    }
}



module.exports = { getSurvey, postSurvey };