import 'dotenv/config';
import express from 'express';
import AppModule from './app.module';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import cors from 'cors';
import { container } from '@sota/util';

export const middlewaresSymbol = Symbol.for('middlewares');

type User = {
    email: string;
};

declare module 'express-session' {
    interface SessionData {
        user: User;
    }
}

const app = express();
const port = 3001;
const router = express.Router();

let redisClient = createClient({
    database: 1,
});
redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sota:',
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
app.use(express.urlencoded({ extended: true }));

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
