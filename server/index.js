const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const rootPath = path.join(__dirname, '..');
const staticPath = path.join(rootPath, './static');

app.use(express.static(staticPath));

// 连接mongodb
const dbUrl = 'mongodb://localhost';
mongoose.connect(dbUrl, (err) => {
    if (err) {
        return console.error(err);
    }
    console.log('mongodb connected');
});
const Place = mongoose.model('Place', { name: String });

// 定义路由
app.get('/places', (req, res) => {
    Place.find({}, (err, places) => {
        res.send(places);
    })
});
app.post('/places', (req, res) => {
    const place = new Place(req.body);
    place.save((err) => {
        if (err) {
            res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})

const server = app.listen(3000, () => {
    console.log('server is running...');
});