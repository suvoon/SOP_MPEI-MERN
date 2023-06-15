const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initSchemas } = require('./middleware/schemaStorage');
const { secure } = require('./middleware/security');
const { userLogin } = require('./controllers/userLogin');
const { getSurvey, postSurvey } = require('./controllers/surveyController');
const { getUsers, createUser, updateUser, deleteUser } = require('./controllers/userController');
const { createSurvey, getSurveys, deleteSurvey, updateSurvey } = require('./controllers/surveysController');
const { getGroups } = require('./controllers/getGroups');
const { getGroupResults } = require('./controllers/getGroupResults');
const { getSurveyResults } = require('./controllers/getSurveyResults');
const { getForums, createForum, deleteForum } = require('./controllers/forumController');
const { getComments, createComment, deleteComment } = require('./controllers/commentController');
const { adminCheck } = require('./middleware/adminCheck');
const { errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.port || 8000;
const app = express();

// Обеспечение безопасности (ограничение трафика, доступа с различных источников)
secure(app);

// Инициализация схем БД
initSchemas();

app.use(bodyParser.urlencoded({ extended: true }));

// Обработка авторизации
app.post('/login', userLogin);

// Получение запросов с параметрами
app.get('/surveys', getSurveys);

// Получение страницы опроса и публикация результата
app.route('/survey')
    .get(getSurvey)
    .post(postSurvey)

// Работа с пользователями в панели администратора
app.route('/admin/user')
    .get(getUsers)
    .post(createUser)
    .put(updateUser)
    .delete(deleteUser)

// Работа с опросами в панели администратора
app.route('/admin/survey')
    .post(createSurvey)
    .delete(deleteSurvey)
    .put(updateSurvey)

// Получение списка групп
app.get('/groups', getGroups);

// Получение результатов группы
app.get('/results/bygroup', getGroupResults);

// Получение результатов опроса
app.get('/results/bysurvey', getSurveyResults);

// Получение, публикация и удаление обсуждения
app.route('/forums')
    .get(getForums)
    .post(createForum)
    .delete(deleteForum)

// Получение, публикация и удаление комментариев
app.route('/forum')
    .get(getComments)
    .post(createComment)
    .delete(deleteComment)

// Проверка прав администратора
app.get('/admincheck', adminCheck);

// Обработка ошибок
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
});