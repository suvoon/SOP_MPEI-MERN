const express = require('express');
let mongoose = require("mongoose");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const encodeID = require('encodeID')();

const PORT = process.env.port || 8000;

mongoose.connect("mongodb://localhost:27017/sop_db",
    { useNewUrlParser: true, useUnifiedTopology: true });
let Schema = mongoose.Schema;
let userSchema = new Schema({
    uid: String,
    name: String,
    login: String,
    password: String,
    salt: String,
    token: String,
    admin: Boolean,
    group: String,
    description: String
})
let dbUsers = mongoose.model('User', userSchema);

let surveysSchema = new Schema({
    oid: String,
    period: String,
    description: String,
    start_date: Date,
    end_date: Date,
    groups: Array,
    link: String,
    content: Array,
    completed: Array
})
let dbSurveys = mongoose.model('Survey', surveysSchema);

let resultsSchema = new Schema({
    login: String,
    group: String,
    survey_id: String,
    questions: Array
})
let dbResults = mongoose.model('Results', resultsSchema);

let groupsSchema = new Schema({
    name: String,
    students_n: Number
});
let dbGroups = mongoose.model('Groups', groupsSchema);

let topicsSchema = new Schema({
    headline: String,
    description: String,
    date: Date,
    author: String,
    author_id: String
});
let dbTopics = mongoose.model('Topics', topicsSchema);

let commentsSchema = new Schema({
    topic_id: String,
    text: String,
    date: Date,
    author: String,
    author_id: String
});
let dbComments = mongoose.model('Comments', commentsSchema);

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', (req, res) => {

    const login = req.body.login;
    const password = req.body.password;

    dbUsers.find({ login, password }, (err, docs) => {
        //console.log(docs, err);

        if (err || !docs[0]) {
            console.log("NOT FOUND");
            res.status(404).send({ errors: "error" });
        } else {
            const tokenData = {
                id: docs[0]._id,
                login: docs[0].login,
                group: docs[0].group
            }
            const newToken = jwt.sign(tokenData, process.env.JWT_SECRET);

            dbUsers.updateOne({ login: login }, { token: newToken }, err => {
                if (err) console.log("ERROR UPDATING USER TOKEN:", err);
            });

            docs[0].token = newToken;
            res.json({
                name: docs[0].name,
                token: docs[0].token,
                admin: docs[0].admin,
                desc: docs[0].description
            });
        }
    });
});

app.get('/surveys', (req, res) => {

    const group = req.query.group === "true" ? true : false;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');

            const findQuery = group
                ?
                {
                    groups: { $in: [user.group] },
                    completed: { $nin: [user.login] }
                }
                :
                {

                }

            const findSurveys = dbSurveys
                .find(findQuery)
                .select({ period: 1, start_date: 1, end_date: 1, link: 1 });
            findSurveys.exec((err, surveys) => {
                if (err) console.log("FINDING error", err);
                res.json(surveys);
            })
        });
    }
});

app.get('/survey', (req, res) => {

    const surveyID = req.query.surveyID;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            const decodedID = encodeID.decode(surveyID);
            const findSurveys = dbSurveys
                .find({
                    _id: decodedID,
                    groups: { $in: [user.group] },
                    completed: { $nin: [user.id] }
                })
                .select({ period: 1, description: 1, content: 1 });
            findSurveys.exec((err, surveys) => {
                if (err) res.send(404, 'Survey not found');
                res.json(surveys[0]);
            })
        });
    }
});

app.post('/survey', (req, res) => {

    const surveyID = req.body.surveyID;

    const accessToken = req.body.token;
    if (!accessToken) res.status(401).send('Unauthorized request');
    else {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');

            const decodedID = encodeID.decode(surveyID);
            dbSurveys
                .updateOne(
                    { _id: decodedID },
                    { $push: { completed: user.login } },
                    err => {
                        if (err) console.log("ERROR UPDATING COMPLETED USERS:", err);
                    }
                );

            //TODO: Добавить тип вопроса в данные (возможно в поле name input-a)

            let questions = [];
            for (field in req.body) {
                if (field.includes('question')) {
                    questions.push(req.body[field]);
                }
            };

            dbResults.create(
                {
                    login: user.login,
                    group: user.group,
                    survey_id: decodedID,
                    questions: questions
                },
                err => {
                    if (err) console.log("ERROR CREATING RESULTS:", err);
                }
            );

        });
    }
});

app.get('/admin/user', (req, res) => {

    const query = req.query.query;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            const findUsers = dbUsers
                .find({
                    $or: [
                        { group: query },
                        { name: { $regex: '.*' + query + '.*' } },
                        { login: { $regex: '.*' + query + '.*' } }
                    ]
                })
                .select({ name: 1, login: 1, admin: 1, group: 1 });
            findUsers.exec((err, dbuser) => {
                res.json(dbuser || []);
            })
        });
    }
});

app.post('/admin/user', (req, res) => {

    const { name, login, password, group, admin } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');

            dbUsers.create(
                {
                    name,
                    login,
                    password,
                    salt: '',
                    token: '',
                    admin,
                    group,
                    description: 'Пользователь'
                },
                err => {
                    if (err) console.log("ERROR CREATING USER:", err);
                    else {
                        res.send(`Пользователь ${name} успешно создан`);
                    }
                }
            );
        });
    }
});

app.delete('/admin/user', (req, res) => {

    const { id, name } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            dbUsers.deleteOne({ _id: id },
                err => {
                    if (err) console.log("ERROR DELETING USER:", err)
                    else res.send(`Пользователь ${name} успешно удалён`);
                }
            );
        });
    }
});

app.post('/admin/survey', (req, res) => {

    let { period, description, start_date, end_date, groups, title, question, qfield } = req.body;
    if (req.body.desc_default) description = "Укажите Вашу оценку учебного курса и преподавателя по указанным характеристикам. Каждая характеристика оценивается по 5-балльной шкале, где 1 - характеристика на очень низком уровне, 5 - характеристика на очень высоком уровне. Если Вы не посещали занятия по курсу или не можете оценить характеристику, отметьте 'Затрудняюсь ответить'";
    groups = groups.replace(/ /g, '').split(",");

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

    const accessToken = req.body.token;
    if (!accessToken) res.status(401).send('Unauthorized request');
    else {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');

            const _id = mongoose.Types.ObjectId();
            const link = encodeID.encode(_id.valueOf());
            dbSurveys.create(
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
                },
                err => {
                    if (err) console.log("ERROR CREATING SURVEY:", err);
                    else {
                        res.redirect(`localhost:3000/`);
                    }
                }
            );

        });
    }
});

app.delete('/admin/survey', (req, res) => {

    const surveyID = req.body.surveyID;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');

            dbSurveys.deleteOne({ _id: surveyID },
                err => {
                    if (err) console.log("ERROR DELETING SURVEY:", err);
                }
            );

            dbResults.deleteMany({ survey_id: surveyID },
                err => {
                    if (err) console.log("ERROR DELETING SURVEY:", err);
                }
            );

            res.send(`Опрос ${surveyID} успешно удалён`);

        });
    }
});

app.get('/groups', (req, res) => {
    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                dbGroups.find({},
                    (err, groups) => {
                        if (err) console.log("ERROR FINDING GROUPS:", err);
                        res.send(
                            groups.map(group => [group.name, group.students_n])
                        )
                    }
                );
            }
        });
    }
});

app.get('/results/bygroup', (req, res) => {
    const group = req.query.group;
    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err_jwt, user) => {
            if (err_jwt) res.status(401).send('Unauthorized request');
            //TODO: ПРОМИСИФИЦИРОВАТЬ ЭТОТ УЖАС
            else {
                dbSurveys.find({ groups: group },
                    (err_s, surveys) => {
                        s_id = surveys.map(survey => survey.id);
                        dbResults.find({ survey_id: s_id },
                            (err_r, results) => {
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

                            }
                        )
                    }
                );
            }
        });
    }
})

app.get('/results/bysurvey', (req, res) => {
    const survey_query = req.query.survey;
    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err_jwt, user) => {
            if (err_jwt) res.status(401).send('Unauthorized request');
            //TODO: ПРОМИСИФИЦИРОВАТЬ ЭТОТ УЖАС
            else {
                dbSurveys.findOne({ _id: survey_query },
                    (err_s, survey_db) => {
                        dbResults.find({ survey_id: survey_query },
                            (err_r, results) => {
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
                            }
                        )
                    }
                );
            }
        });
    }
});

app.get('/forums', (req, res) => {

    const { query, category, sortby } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                dbTopics.find({
                    //PARAMS
                },
                    (err, topics) => {
                        if (err) console.log("ERROR FINDING GROUPS:", err);
                        res.send(

                        )
                    }
                );
            }
        });
    }
});


app.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
});