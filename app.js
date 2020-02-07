// npm install --save express-validator
// npm install --save mongodb
// npm install --save mongoose
// npm install --save multer
//mongo db user ramiro pwd ramiro29
// mongodb+srv://ramiro:<password>@phzcluster0-9pdn0.mongodb.net/test?retryWrites=true&w=majority
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoConnect = require('./util/database');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg'
    ){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded());// x-www-form-urlenconded <form>
app.use(bodyParser.json());// application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

//CORS HEADERS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', feedRoutes);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message});
});

mongoose.connect(
    'mongodb+srv://ramiro:ramiro29@phzcluster0-9pdn0.mongodb.net/dbtest?retryWrites=true&w=majority'
).then(result => {
    app.listen(8080);
})
.catch(err => console.log(err));


// mongoConnect(() => {
//     // console.log(client);
//     app.listen(8080);
// });