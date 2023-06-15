let mongoose = require("mongoose");
let schemas = {};

function initSchemas() {

    // Подключение к БД и инициализация схем Mongoose
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

    schemas = { dbUsers, dbSurveys, dbResults, dbGroups, dbTopics, dbComments }
}

// Возвращение объекта схем
function getSchemas() {
    return schemas;
}

module.exports = {
    initSchemas,
    getSchemas
};