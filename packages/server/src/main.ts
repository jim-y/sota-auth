import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import AppModule from './app.module';
import RedisStore from 'connect-redis';
import session from 'express-session';
import '#cache/cache';
import cors from 'cors';
import { container } from '@sota/util/decorators';
import { User } from '#types/user.type';

export const middlewaresSymbol = Symbol.for('middlewares');

declare module 'express-session' {
    interface SessionData {
        user: User;
        login: any;
    }
}

const app = express();
const port = 3001;
const router = express.Router();

const redisClient = container.get('Cache');

let redisStore = new RedisStore({
    client: redisClient.client,
    prefix: 'session:',
});

app.use(
    session({
        store: redisStore,
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
        secret: process.env.SESSION_SECRET,
    })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await next();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

container.register('NODE_ENV', {
    type: 'constant',
    value: process.env.NODE_ENV,
});

const routes = AppModule['routes'];

for (const route of routes) {
    const controller = container.get(route.controller);
    const middlewareFunctions = controller.constructor[Symbol.metadata][middlewaresSymbol]?.[route.action] ?? [];
    middlewareFunctions.push((req, res) => {
        controller[route.action].call(controller, req, res);
    });
    router[route.method](route.path, ...middlewareFunctions);
}

app.use('/api', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    redisClient.client.disconnect();
    process.exit(0);
});
