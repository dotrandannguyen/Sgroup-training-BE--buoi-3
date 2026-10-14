export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
    const message = err.message || "Internal Server Error";

    // Log to console for debugging
    console.error(`[Error] ${statusCode} - ${message}`, err.stack || err);
    
    const response = {
        success: false,
        status: statusCode,
        message: err.code === 'ER_DUP_ENTRY' ? "Dữ liệu đã tồn tại trong hệ thống" : message,
    };

    // If there are detailed validation errors
    const errors = err.errors || (err.error && err.error.issues);
    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    res.status(statusCode).json(response);
};
