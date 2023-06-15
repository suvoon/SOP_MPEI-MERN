const crypto = require('crypto');

const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getUsers(req, res, next) {
    try {
        // Получение поискового запроса из параметров запроса
        const query = req.query.query;

        // Получение схемы и аутентификация по токену
        let { dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Поиск пользователя по запросу
            await dbUsers
                .find({
                    $or: [
                        { group: query },
                        { name: { $regex: '.*' + query + '.*' } },
                        { login: { $regex: '.*' + query + '.*' } }
                    ]
                })
                .select({ name: 1, login: 1, admin: 1, group: 1 })
                .then(dbuser => res.json(dbuser || []));
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function createUser(req, res, next) {
    try {
        // Получение имени пользователя, логина, пароля, группы и флага прав администратора из тела запроса
        const { name, login, password, group, admin } = req.body;

        // Получение схемы и аутентификация по токену
        let { dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            await dbUsers
                .find({ login })
                .then(docs => {
                    if (!docs[0]) {
                        let salt = crypto.randomBytes(128).toString('base64');
                        let iterations = 10000;

                        // Шифрование пароля с параметрами
                        const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
                        const hash = derivedKey.toString('hex');
                        return { salt, iterations, hash }
                    }
                    else res.send(`Логин уже существует`);
                })
                .then(({ salt, iterations, hash }) => {
                    return dbUsers.create(
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
                        })
                })
                .then(result => res.send(`Пользователь ${name} успешно создан`))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        // Получение имени пользователя, логина, пароля, группы и флага прав администратора из тела запроса
        const { name, login, password, group, admin, userID } = req.body;

        // Получение схемы и аутентификация по токену
        let { dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Объект с данными обновлённого пользователя
            let updatedUser = {
                name: name || 'NONAME',
                login: login || Math.random(5000),
                admin,
                group
            };
            if (password !== '') {
                const salt = crypto.randomBytes(128).toString('base64');
                const iterations = 10000;
                let hash;

                // Шифрование пароля с параметрами
                crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
                    hash = derivedKey.toString('hex');
                    updatedUser['salt'] = salt;
                    updatedUser['iterations'] = iterations;
                    updatedUser['password'] = hash;
                });
            }

            // Обновление записи с последующей отправкой результата
            await dbUsers
                .updateOne({ _id: userID }, updatedUser)
                .then(result => res.send(`Пользователь ${name} успешно обновлён`))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        // Получение идентификатора и имени пользователя из тела запроса
        const { id, name } = req.body;

        // Получение схемы и аутентификация по токену
        let { dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Удаление записи с последующей отправкой результата
            await dbUsers
                .deleteOne({ _id: id })
                .then(result => res.send(`Пользователь ${name} успешно удалён`))
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };