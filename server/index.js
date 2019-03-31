const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const rootPath = path.join(__dirname, '..');
const staticPath = path.join(rootPath, './webroot');

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

// app.get('/', function(req, res) {
//     res.sendFile(path.join(rootPath, './webroot/src/html/app.html'));
// });

// 定义路由
app.get('/items', (req, res) => {
    Place.find({}, (err, places) => {
        res.send(places);
    })
});
app.post('/items/add', (req, res) => {
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