const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function adminCheck(req, res, next) {
    try {
        let ifAdmin = false;

        // Получение схемы и аутентификация по токену
        let { dbUsers } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Поиск пользователя и проверка прав администратора
            await dbUsers
                .find({ _id: user.id })
                .then(docs => {
                    if (!docs[0]) {
                        console.log("NOT FOUND");
                        res.status(404).send({ errors: "error" });
                    } else {
                        res.json(docs[0].admin);
                        ifAdmin = docs[0].admin;
                    }
                })

            return ifAdmin;
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { adminCheck };