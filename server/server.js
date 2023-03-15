const express = require('express');
let mongoose = require("mongoose");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const replaceDisallowedWords = require('disallowed-word-filter')
const crypto = require('crypto');
const encodeID = require('encodeID')();

const PORT = process.env.port || 8000;

mongoose.connect("mongodb://localhost:27017/sop_db",
    { useNewUrlParser: true, useUnifiedTopology: true });
let Schema = mongoose.Schema;
let userSchema = new Schema({
    name: String,
    login: String,
    password: String,
    salt: String,
    iterations: Number,
    token: String,
    admin: Boolean,
    group: String,
    description: String
})
let dbUsers = mongoose.model('User', userSchema);

let surveysSchema = new Schema({
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
    category: String,
    link: String,
    date: Date,
    author: String,
    author_id: String,
    comments: Number
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

    dbUsers.find({ login }, (err, docs) => {
        //console.log(docs, err);

        if (err || !docs[0]) {
            console.log("NOT FOUND");
            res.status(404).send({ errors: "error" });
        } else {
            let passwordAttempt;
            crypto.pbkdf2(password, docs[0].salt, docs[0].iterations, 64, 'sha512',
                (err, derivedKey) => {
                    passwordAttempt = derivedKey.toString('hex');
                });
            if (docs[0].password == passwordAttempt) {
                const tokenData = {
                    id: docs[0]._id,
                    login: docs[0].login,
                    group: docs[0].group,
                    name: docs[0].name
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
            } else {
                res.status(404).send({ errors: "error" });
            }

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
                .select({ period: 1, start_date: 1, end_date: 1, link: 1, description: 1 });
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
            else {
                let salt = crypto.randomBytes(128).toString('base64');
                let iterations = 10000;
                let hash;
                crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
                    hash = derivedKey.toString('hex');
                });

                dbUsers.create(
                    {
                        name,
                        login,
                        password: hash,
                        salt: salt,
                        iterations,
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
            }

        });
    }
});

app.put('/admin/user', (req, res) => {

    const { name, login, password, group, admin, userID } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                let updatedUser = {
                    name: name || 'NONAME',
                    login: login || Math.random(5000),
                    admin,
                    group
                };
                if (password !== '') {
                    let salt = crypto.randomBytes(128).toString('base64');
                    let iterations = 10000;
                    let hash;
                    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
                        hash = derivedKey.toString('hex');
                    });
                    updatedUser['salt'] = salt;
                    updatedUser['iterations'] = iterations;
                    updatedUser['password'] = hash;
                }

                dbUsers.updateOne(
                    { _id: userID },
                    updatedUser,
                    err => {
                        if (err) console.log("ERROR UPDATING USER:", err);
                        else {
                            res.send(`Пользователь ${name} успешно обновлён`);
                        }
                    }
                );
            }

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

app.put('/admin/survey', (req, res) => {

    const { period, startdate, enddate, description, surveyID } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                let updatedSurvey = {
                    period,
                    description,
                    start_date: new Date(startdate),
                    end_date: new Date(enddate)
                };

                dbSurveys.updateOne(
                    { _id: surveyID },
                    updatedSurvey,
                    err => {
                        if (err) console.log("ERROR UPDATING SURVEY:", err);
                        else {
                            res.send(`Опрос ${period} успешно обновлён`);
                        }
                    }
                );
            }

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

    const { topicsquery, category, sortby } = req.query;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
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

                const findTopics = dbTopics
                    .find(searchQuery)
                    .sort(sortQuery)
                    .select({ headline: 1, category: 1, comments: 1, link: 1 });
                findTopics.exec((err, topics) => {
                    if (err) console.log("ERROR FINDING TOPICS:", err);
                    res.send(
                        topics ?? []
                    )
                })
            }
        });
    }
});

app.post('/forums', (req, res) => {

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
    description = description.slice(0, 200);
    headline = headline.slice(0, 100);
    const myFilter = new replaceDisallowedWords({
        additionalWords: 'ъзъ'
    });

    if (headline.length < 4) res.send('Слишком короткое название темы')
    else if (description.length < 10) res.send('Слишком короткое описание вопроса')
    else if (myFilter.check(headline, true) || myFilter.check(description, true)) res.send('Тема/заголовок содержит недопустимые слова')
    else {
        const auth_header = req.headers.authorization;
        if (!auth_header) res.status(401).send('Unauthorized request');
        else {
            const accessToken = auth_header.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
                if (err) res.status(401).send('Unauthorized request');

                const _id = mongoose.Types.ObjectId();
                const link = encodeID.encode(_id.valueOf());
                dbTopics.create(
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
                    },
                    err => {
                        if (err) console.log("ERROR CREATING TOPIC:", err);
                        else {
                            res.send('Обсуждение успешно создано');
                            //res.redirect(`localhost:3000/`);
                        }
                    }
                );

            });
        }
    }

});

app.get('/forum', (req, res) => {

    const forumID = req.query.forumID;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            const decodedID = encodeID.decode(forumID);
            const findTopic = dbTopics
                .find({
                    _id: decodedID
                })
                .select({ headline: 1, description: 1, date: 1, author: 1, comments: 1 });
            findTopic.exec((err, topics) => {
                if (err) res.status(404).send('forum not found');
                else {
                    const findComments = dbComments
                        .find({
                            topic_id: decodedID
                        })
                        .select({ text: 1, date: 1, author: 1, author_id: 1 });
                    findComments.exec((err, comments) => {
                        res.json({
                            topic: topics[0],
                            comments
                        });
                    });
                }
            })
        });
    }
});

app.delete('/forums', (req, res) => {

    let { forum_id } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                const decodedID = encodeID.decode(forum_id);
                dbUsers.find({ _id: user.id }, (err, docs) => {
                    //console.log(docs, err);

                    if (err || !docs[0] || !docs[0].admin) {
                        console.log("NOT FOUND");
                        res.status(404).send({ errors: "error" });
                    } else {
                        dbTopics.deleteOne({ _id: decodedID },
                            err => {
                                if (err) console.log("ERROR DELETING FORUM:", err);
                            }
                        );

                        dbComments.deleteMany({ topic_id: decodedID },
                            err => {
                                if (err) console.log("ERROR DELETING COMMENTS:", err);
                                else {
                                    res.send("OK");
                                }
                            }
                        );
                    }
                });
            }



        });
    }
});

app.post('/forum', (req, res) => {

    let { reply, forum_id } = req.body;
    reply = reply.slice(0, 200);

    const myFilter = new replaceDisallowedWords({
        additionalWords: 'ъзъ'
    });
    if (reply.length < 4) res.send('Слишком короткое сообщение')
    else if (myFilter.check(reply, true)) res.send('Сообщение содержит недопустимые слова')
    else {
        const auth_header = req.headers.authorization;
        if (!auth_header) res.status(401).send('Unauthorized request');
        else {
            const accessToken = auth_header.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
                if (err) res.status(401).send('Unauthorized request');
                else {
                    const decodedID = encodeID.decode(forum_id);
                    dbComments.create(
                        {
                            topic_id: decodedID,
                            text: reply,
                            date: new Date(),
                            author: user.name,
                            author_id: user.id
                        },
                        err => {
                            if (err) console.log("ERROR CREATING COMMENT:", err);
                            else {
                                dbTopics
                                    .updateOne(
                                        { _id: decodedID },
                                        { $inc: { comments: 1 } },
                                    )
                                    .exec(err => { if (err) console.log('ERROR INCREMENTING COMMENTS') }
                                    );
                                res.send('');
                                //res.redirect(`localhost:3000/`);
                            }
                        }
                    );
                }


            });
        }
    }

});

app.delete('/forum', (req, res) => {

    let { comment_id, forum_id } = req.body;

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                const decodedID = encodeID.decode(forum_id);
                dbUsers.find({ _id: user.id }, (err, docs) => {
                    //console.log(docs, err);

                    if (err || !docs[0] || !docs[0].admin) {
                        console.log("NOT FOUND");
                        res.status(404).send({ errors: "error" });
                    } else {
                        dbComments.deleteOne({ _id: comment_id },
                            err => {
                                if (err) console.log("ERROR DELETING COMMENT:", err);
                                else {
                                    dbTopics
                                        .updateOne(
                                            { _id: decodedID },
                                            { $inc: { comments: -1 } },
                                        )
                                        .exec(err => {
                                            if (err) console.log('ERROR DECREMENTING COMMENTS', err)
                                            else res.send('OK');
                                        }
                                        );
                                }
                            }
                        );
                    }
                });
            }

        });
    }
});

app.get('/admincheck', (req, res) => {

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            else {
                dbUsers.find({ _id: user.id }, (err, docs) => {
                    //console.log(docs, err);

                    if (err || !docs[0]) {
                        console.log("NOT FOUND");
                        res.status(404).send({ errors: "error" });
                    } else {
                        res.json(docs[0].admin);
                    }
                });
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
});