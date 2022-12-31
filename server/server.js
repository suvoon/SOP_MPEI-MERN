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
    survey_id: String,
    questions: Array
})
let dbResults = mongoose.model('Results', resultsSchema);

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

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            const findSurveys = dbSurveys
                .find({
                    groups: { $in: [user.group] },
                    completed: { $nin: [user.login] }
                })
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
                .select({ name: 1, login: 1, admin: 1 });
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

app.get('/admin/survey', (req, res) => {

    const auth_header = req.headers.authorization;
    if (!auth_header) res.status(401).send('Unauthorized request');
    else {
        const accessToken = auth_header.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(401).send('Unauthorized request');
            const findSurveys = dbSurveys
                .find()
                .select({ period: 1, start_date: 1, end_date: 1, link: 1 });
            findSurveys.exec((err, surveys) => {
                if (err) console.log("FINDING error", err);
                res.json(surveys);
            })
        });
    }
});

app.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
});