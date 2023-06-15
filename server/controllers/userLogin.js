const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { getSchemas } = require('../middleware/schemaStorage');

async function userLogin(req, res, next) {
    try {
        // Получение логина и пароля из тела запроса
        const { login, password } = req.body;

        // Получение схемы
        const { dbUsers } = getSchemas();

        // Поиск пользователя по введённым данным
        await dbUsers
            .find({ login })
            .then(docs => {
                if (!docs[0]) {
                    res.status(404).send({ errors: "error" });
                    throw new Error('Failed password attempt');
                } else {
                    // Шифрование пароля с параметрами
                    const derivedKey = crypto.pbkdf2Sync(password, docs[0].salt, docs[0].iterations, 64, 'sha512')
                    let passwordAttempt = derivedKey.toString('hex');
                    if (docs[0].password == passwordAttempt) {
                        const tokenData = {
                            id: docs[0]._id,
                            login: docs[0].login,
                            group: docs[0].group,
                            name: docs[0].name
                        }
                        const newToken = jwt.sign(tokenData, process.env.JWT_SECRET);

                        docs[0].token = newToken;
                        return docs[0]
                    } else {
                        // Отправка ошибки при некорректных данных
                        res.status(404).send({ errors: "error" });
                        throw new Error('Failed password attempt');
                    }

                }
            })
            .then((doc) => {
                // Обновление токена пользователя
                dbUsers.updateOne({ login: login }, { token: doc.token });
                return doc;
            })
            .then((doc) => {
                // Отправка ответа
                res.json({
                    name: doc.name,
                    token: doc.token,
                    admin: doc.admin,
                    desc: doc.description
                });
            })
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок с кодом 500
        err.status = 500;
        next(err);
    }
}

module.exports = { userLogin };