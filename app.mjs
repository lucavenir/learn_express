import express from 'express';
import dotenv from 'dotenv';
import connection from './db/connect.js';

// starup
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

async function start() {
    try {
        console.log("db connection..");
        await connection(process.env.MONGO_URI);
        console.log("db connected");
        console.log("starting our server..");
        app.use((req, res, next) => {
            console.log('Time: ', Date.now());
            next();
        });
        app.use('/', (req, res, next) => {
            console.log('request url: ', req.originalUrl);
            next();
        })
        app.listen(port, () => {
            console.log(`server running on port ${port}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();