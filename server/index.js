const path = require('path');
const express = require('express');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');

import models, { connectDb } from './model/index.js';
import routes from './routes';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
    req.context = {
        models
    };
    next();
});

const rootPath = path.join(__dirname, '..');
const staticPath = path.join(rootPath, './webroot');

app.use(express.static(staticPath));

// 连接mongodb
connectDb().then(async () => {
    app.listen(3000, () => {
        console.log('server is running...');
    });
});
