const logger = require("../config/logger");

console.log("LOGGER CHECK:", logger); 

const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = stream;