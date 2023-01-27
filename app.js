const express = require('express');
require('dotenv').config()
const app = express();
const router = require('./router/router')

app.use('/', router)

app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});