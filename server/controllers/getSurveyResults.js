const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getSurveyResults(req, res, next) {
    try {
        // Получение идентификатора опроса из параметров запроса
        const survey_query = req.query.survey;

        // Получение схемы и аутентификация по токену
        let { dbSurveys, dbResults } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Получение опроса из БД
            const survey_db = await dbSurveys.findOne({ _id: survey_query });

            // Получение результатов опроса
            await dbResults.find({ survey_id: survey_query })
                .then((results) => {
                    const survey_data = {
                        period: survey_db.period,
                        groups: survey_db.groups,
                        content: survey_db.content,
                        completed: survey_db.completed.length
                    };
                    res.send([survey_data, results.map(result_db => ({
                        questions: result_db.questions,
                        group: result_db.group
                    })
                    )]);
                })

        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { getSurveyResults };