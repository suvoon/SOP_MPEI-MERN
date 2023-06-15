function disablePoweredBy(request, response, next) {
    // Исключение заголовка, указывающего технологии сервера
    response.removeHeader("X-Powered-By")

    next();
}

module.exports = {
    disablePoweredBy
};
