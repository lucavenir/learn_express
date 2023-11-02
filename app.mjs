import express from 'express';
import dotenv from 'dotenv';

// testing
dotenv.config();
console.log(process.env.MONGO_URI);

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("hello");
});

app.listen(port);
