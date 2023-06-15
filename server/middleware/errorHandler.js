async function errorHandler(error, request, response, next) {

    // Не выводить ошибки, связанные с неправильным паролем
    if (!error.message.includes("password")) console.log("GLOBAL ERROR", error);

    // Если ответ не отправлен, отправить ответ с ошибкой
    if (!response.headersSent) {
        response.status(error.status || 500).send({
            status: "error",
            message: error.message,
        });
    }
}

module.exports = { errorHandler };