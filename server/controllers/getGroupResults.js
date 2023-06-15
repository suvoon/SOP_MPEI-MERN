const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getGroupResults(req, res, next) {
    try {
        // Получение группы из параметров запроса
        const group = req.query.group;

        // Получение схемы и аутентификация по токену
        let { dbSurveys, dbResults } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Получение опросов, которые назначены группе
            let surveys = await dbSurveys.find({ groups: group });

            const s_id = surveys.map(survey => survey.id);

            // Получение результатов этих опросов
            await dbResults
                .find({ survey_id: s_id })
                .then(results => {
                    res.send(
                        surveys.map(survey => {
                            resArr = [];
                            results.forEach(s_res => {
                                if (s_res.survey_id === survey.id) {
                                    resArr.push(s_res.questions);
                                }
                            });
                            return {
                                surveyName: survey.period,
                                surveyQuestions: survey.content,
                                surveyResults: resArr
                            }
                        })
                    )
                })

        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { getGroupResults };