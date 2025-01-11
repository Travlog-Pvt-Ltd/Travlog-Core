import express from 'express';
import log from 'npmlog';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 204,
    })
);
app.options('*', cors());

export const server = app.listen(process.env.PORT, () => {
    log.info(`Server listening on port ${process.env.PORT}!`);
});

export default app;
