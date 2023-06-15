const { authorize } = require('../middleware/authorizeRequest');
const { getSchemas } = require('../middleware/schemaStorage');

async function getGroups(req, res, next) {
    try {
        // Получение схемы и аутентификация по токену
        let { dbGroups } = getSchemas();
        const { auth, user } = authorize(false, req.headers.authorization);

        if (!auth) res.status(401).send('Unauthorized request');
        else {
            // Получение групп из БД
            await dbGroups
                .find({})
                .then(groups => {
                    res.send(
                        groups.map(group => [group.name, group.students_n])
                    )
                })
        }
    } catch (err) {
        // При появлении ошибки, она отправляется в обработчик ошибок
        next(err);
    }
}

module.exports = { getGroups };