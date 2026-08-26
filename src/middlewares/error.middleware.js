export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log to console for debugging
    console.error(err);
    
    const response = {
        success: false,
        status: error.statusCode,
        message: error.message || "Internal Server Error",
    };

    // If there are detailed validation errors
    if (error.errors && error.errors.length > 0) {
        response.errors = error.errors;
    }

    res.status(error.statusCode).json(response);
};
