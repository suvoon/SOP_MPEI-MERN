const jwt = require('jsonwebtoken');
require('dotenv').config();

// Аутентификация
function authorize(recievedToken, header) {
    // Флаг успешности аутентификации и данные токена
    let auth = false, user = {};

    if (header) {
        const accessToken = recievedToken ? header : header.split(' ')[1];

        // Верификация токена
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, authUser) => {
            if (err) {
                console.log("ERROR")
            }
            else {
                auth = true;
                user = authUser;
            }
        })
    }

    return { auth, user };
}

module.exports = {
    authorize
};