const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()

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
        const tasks = await db.query("SELECT * FROM tasks WHERE user_id = $1 LIMIT $2 OFFSET $3", [decodeData.id, elements, offset]);
        res.json(tasks.rows);
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
        const newTask = await db.query("INSERT INTO tasks(name, descriptions, deadlines, prioritys, user_id) values($1, $2, $3, $4, $5) RETURNING *", [taskName, taskDescription, taskDeadline, taskPriority, userId]);
        // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
        res.json(newTask);
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
        const candidate = await db.query("SELECT * FROM users WHERE login = $1", [userLogin]);
        if (!candidate.rowCount == 0){
            return res.status(400).json({message: "Користувач уже зареєстрований"})
        }
        const hashPassword = await bcrypt.hash(userPassword, 7);

        const newUser = await db.query("INSERT INTO users(name, lastname, login, password) values($1, $2, $3, $4) RETURNING *", [userName, userLastname, userLogin, hashPassword]);

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
        const user = await db.query("SELECT * FROM users WHERE login = $1", [login])
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
        console.log(req);
        if (!req.body) return res.sendStatus(400);
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(400).json({message: "Користувач не авторизований"})
        };
        const decodeData = jwt.verify(token, process.env.SECRET);
        const userId = decodeData.id;
        const taskId = req.body.id;
        const changeTask = await db.query('UPDATE tasks SET done = $1 WHERE user_id = $2 AND id = $3 RETURNING *', [true, userId, taskId]);
        res.json(changeTask);
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
        let changeDescription = await db.query('UPDATE tasks SET descriptions = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [description, taskId, userId]);
        res.json(changeDescription);
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
        const task_id = req.body.id;
        let task = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2  RETURNING *', [task_id, userId]);
        res.json(task.rows[0]);
    } catch (e) {
        console.log(e)
    }
});


app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});