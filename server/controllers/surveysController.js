const encodeID = require('encodeID')();
const mongoose = require('mongoose');

const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getSurveys(req, res, next) {
    try {
        // Получение флага отправки результата по группам из параметров запроса
        const group = req.query.group === "true" ? true : false;

        // Получение схемы и аутентификация по токену
        let { dbSurveys } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) {
            res.status(401).send('Unauthorized request');
        } else {
            // Поиск опросов по группам исключая пройденные пользователем
            const findQuery = group
                ?
                {
                    groups: { $in: [user.group] },
                    completed: { $nin: [user.login] }
                }
                :
                {}

            // Возвращение в ответе опросов по критериям
            await dbSurveys
                .find(findQuery)
                .select({ period: 1, start_date: 1, end_date: 1, link: 1, description: 1 })
                .then(surveys => { res.json(surveys) })
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок с кодом 404
        err.status = 404;
        next(err);
    }
}

async function createSurvey(req, res, next) {
    try {
        let { period, description, start_date, end_date, groups, title, question, qfield } = req.body;

        // Получение схемы и аутентификация по токену
        let { dbSurveys } = getSchemas();
        const { auth, user } = authorize(true, req.body.token);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            if (req.body.desc_default) description = "Укажите Вашу оценку учебного курса и преподавателя по указанным характеристикам. Каждая характеристика оценивается по 5-балльной шкале, где 1 - характеристика на очень низком уровне, 5 - характеристика на очень высоком уровне. Если Вы не посещали занятия по курсу или не можете оценить характеристику, отметьте 'Затрудняюсь ответить'";
            groups = groups.replace(/ /g, '').split(",");

            // Создание записи в БД
            let count = 0;
            const content = title?.map((sTitle, id) => {
                let block = [{ type: "title", value: sTitle }];
                if (question) {
                    question[id].forEach((q, qid) => {
                        block.push({ type: q, name: `question${count}`, value: qfield[id][qid] });
                        count++;
                    });
                };

                return block;
            }).flat();

            const _id = mongoose.Types.ObjectId();
            const link = encodeID.encode(_id.valueOf());

            // Проверка корректности даты
            if ((new Date(start_date).getTime() <= new Date(end_date).getTime())
                && (new Date(end_date).getTime() >= new Date().getTime())) {
                // Создание опроса при корректной дате
                await dbSurveys
                    .create(
                        {
                            _id,
                            period,
                            description,
                            start_date,
                            end_date,
                            groups,
                            link,
                            content,
                            completed: []
                        })
                    .then(result => res.redirect(`http://localhost:3000/?status=success`))
            } else {
                // Отправка ошибки при некорректной дате
                res.redirect(400, `http://localhost:3000/?status=wrongdate`)
            }
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function deleteSurvey(req, res, next) {
    try {
        const surveyID = req.body.surveyID;

        // Получение схемы и аутентификация по токену
        let { dbSurveys, dbResults } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);


        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Удаление опроса с последующим удалением результата
            await dbSurveys
                .deleteOne({ _id: surveyID })
                .then(result => dbResults.deleteMany({ survey_id: surveyID }))
                .then(result => res.send(`Опрос ${surveyID} успешно удалён`))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function updateSurvey(req, res, next) {
    try {
        const { period, startdate, enddate, description, surveyID } = req.body;

        // Получение схемы и аутентификация по токену
        let { dbSurveys } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {

            let updatedSurvey = {
                period,
                description,
                start_date: new Date(startdate),
                end_date: new Date(enddate)
            };

            // Обновление записи с последующей отправкой ответа
            await dbSurveys.updateOne({ _id: surveyID }, updatedSurvey)
                .then(result => res.send(`Опрос ${period} успешно обновлён`))

        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок с кодом 404
        err.status = 404;
        next(err);
    }
}

module.exports = { createSurvey, getSurveys, deleteSurvey, updateSurvey };