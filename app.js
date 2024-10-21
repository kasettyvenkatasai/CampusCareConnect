const express = require('express')
const mongoose = require('mongoose');
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express();
const connect = require('./connection/connection')
const router = require('./routers/router')
connect('mongodb+srv://druvadruvs:Druva%402907@cluster0.7eaal.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
app.use(express.static( path.resolve(__dirname,'views'), { 
    index: false,
    redirect: false,
    extensions: ['html'] 
}));
app.use(express.static( path.resolve(__dirname,'views/styles')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.json())
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname,'views'));
app.use(router)

const port =3005
app.listen(port, () => {
    console.log('Port  listening at 3000');
});
