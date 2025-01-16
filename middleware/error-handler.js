// const errorHandler = (err, res) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong!");
// };

// module.exports = errorHandler;


const logger = require('../utils/logger'); // Import your logger (adjust path as needed)

const errorHandler = (err, req, res, next) => {
    // Log the error details
    logger.error({
        message: err.message,
        stack: err.stack,
        requestId: req.id || 'N/A', // Default to 'N/A' if req.id is not set
    });

    // Send a structured error response
    res.status(500).json({
        error: "Something went wrong!",
        requestId: req.id || 'N/A', // Include request ID in the response if available
    });
};

module.exports = errorHandler;
