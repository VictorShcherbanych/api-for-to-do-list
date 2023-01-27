const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const database = require('./models/users')
const app = express();

const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));

const generateAccessToken = (id) => {
    try {
        const payload = {id};
        return jwt.sign(payload, process.env.SECRET, {expiresIn: "1h"})
    } catch (e){
        concole.log(e)
}}
  
app.get("/api/tasks", async function(req, res){

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"});
    };
        const pageNumber = req.query.page
        const elements = Number(req.query.elements)
        const decodeData = jwt.verify(token, process.env.SECRET);
        let offset = 0
        if (pageNumber){
            offset = Number(pageNumber)*elements-elements
        }
        res.json(await database.getTasks(decodeData, elements, offset));
    } catch (e) {
        console.log(e)}
});

app.post("/api/tasks", jsonParser, async function (req, res) {
     
    try{
        if(!req.body) return res.sendStatus(400);
        const taskName = req.body.name;
        const taskDescription = req.body.descriptions;
        const taskDeadline = req.body.deadlines;
        const taskPriority = req.body.prioritys;
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"})
        };
        const decodeData = jwt.verify(token, process.env.SECRET);
        const userId = decodeData.id;
                // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
        res.json(await database.postTask(taskName, taskDescription, taskDeadline, taskPriority, userId));
    } catch (e) {
        console.log(e)
}
});

app.post("/api/register", jsonParser, async function (req, res) {
    try{      
        if(!req.body) return res.sendStatus(400);
        const userName = req.body.name;
        const userLastname = req.body.lastname;
        const userLogin = req.body.login;
        const userPassword = req.body.password;
        const candidate = await database.getUser(userLogin);
        if (!candidate.rowCount == 0){
            return res.status(400).json({message: "Користувач уже зареєстрований"})
        }
        const hashPassword = await bcrypt.hash(userPassword, 7);
        await database.createUser(userName, userLastname, userLogin, hashPassword)
        // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
        res.json({message: `Користувача ${userName} ${userLastname} створено`});
    } catch(e) {
        console.log(e)
    }  
});

app.post("/api/login", jsonParser, async function (req, res) {
    try{
        if(!req.body) return res.sendStatus(400);
        const login = req.body.login;
        const password = req.body.password;
        const user = await database.getUser(login)
        if (!user.rowCount){
            return res.status(400).json({message: "Користувач не зареєстрований"})
        }
        const validatePassword = bcrypt.compareSync(password, user.rows[0].password);
        if (!validatePassword){
            return res.status(400).json({message: "Неправильний пароль"});
        }
        const token = generateAccessToken(user.rows[0].id);
        res.json({token});
    } catch (e) {
        console.log(e)
    } 
});

app.patch('/api/tasks', jsonParser, async function (req, res){

    try{
        if (!req.body) return res.sendStatus(400);
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"})
        };
        const decodeData = jwt.verify(token, process.env.SECRET);
        const userId = decodeData.id;
        const taskId = req.body.id;
        res.json(await database.doneTask(userId, taskId));
    } catch (e) {
        console.log(e)
    }
})

app.put('/api/tasks/descriptions', jsonParser, async function (req,res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"});
        };
        const decodeData = jwt.verify(token, process.env.SECRET);
        const userId = decodeData.id;
        if (!req.params) return res.sendStatus(400);
        const taskId = req.body.id;
        const description = req.body.descriptions;
        res.json(await database.updateDescription(description, taskId, userId));
    } catch (e) {
        console.log(e)
    }   
})

app.delete('/api/tasks', jsonParser, async function(req, res){
    try{
        if(!req.params) return res.sendStatus(400);
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"})};
        const decodeData = jwt.verify(token, process.env.SECRET)
        const userId = decodeData.id
        const taskId = req.body.id;
        res.json(await database.deleteTask(taskId, userId));
    } catch (e) {
        console.log(e)
    }
});


app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});