import * as Sentry from '@sentry/node';
import jwt from 'jsonwebtoken';

export const asyncControllerHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
    if (process.env.MODE === 'prod') Sentry.captureException(err);
    res.status(500).json({
        message: err.message || 'Something went wrong. We are looking into it.',
    });
};

export const extractUserIdFromToken = (req, res, next) => {
    if (req?.headers?.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const designation = req.headers.authorization.split(' ')[0];
        let decodedData;
        if (designation === 'Bearer') {
            decodedData = jwt.verify(token, process.env.USER_SECRET);
            req.userId = decodedData?.id;
        }
    }
    next();
};
