import * as Sentry from '@sentry/node';

export const asyncControllerHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
    if (process.env.MODE === 'prod') Sentry.captureException(err);
    res.status(500).json({
        message: err.message || 'Something went wrong. We are looking into it.',
    });
};
