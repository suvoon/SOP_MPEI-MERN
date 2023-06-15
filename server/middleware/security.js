const { disablePoweredBy } = require("./disablePoweredBy");

const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const slowDown = require('express-slow-down');

function secure(app) {
    app.use(disablePoweredBy);

    // Ограничение доступа с различных источников (в данный момент не установлено)
    app.use(cors());

    // Ограничение трафика
    const limiter = rateLimiter({
        windowMs: 1 * 60 * 1000,
        max: 120,
    });

    // Задержка ответов при большом количестве запросов
    const speedLimiter = slowDown({
        windowMs: 1 * 60 * 1000,
        delayAfter: 100,
        delayMs: 1000,
    });

    app.use(speedLimiter);
    app.use(limiter);
};

module.exports = {
    secure
};
