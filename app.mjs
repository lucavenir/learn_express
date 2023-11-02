import express from 'express';
import dotenv from 'dotenv';
import connection from './db/connect.js';
import InvalidCustomerId from './errors/invalidCustomerId.js';

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
            const seconds = new Date().getSeconds();
            req.accessGranted = seconds % 2 === 0;
            req.requestSeconds = seconds;
            next();
        });
        app.get("/", (req, res) => {
            const seconds = req.requestSeconds;
            req.accessGranted
                ? res.status(200).json({ msg: `Access granted at ${seconds}` })
                : res.status(403).json({ msg: `Access denied at ${seconds}` });
        });
        app.get("/customer/:id", (req, res) => {
            const id = req.params.id;
            if (isNaN(id)) throw new InvalidCustomerId(id);
            res.json({ id });
        });
        
        app.use((err, req, res, next) => {
            if (!(err instanceof InvalidCustomerId)) return res.status(500).json({ error: err });

            res.status(err.statusCode).json({ error: err.message });
        });
        
        app.listen(port, () => {
            console.log(`server running on port ${port}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();