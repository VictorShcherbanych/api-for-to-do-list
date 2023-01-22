const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {secret} = require("./config")

const app = express();
const jsonParser = express.json();
  
app.use(express.static(__dirname + "/public"));


const generateAccessToken = (id) => {
    const payload = {
        id
    };
    return jwt.sign(payload, secret, {expiresIn: "1h"})
}

  
app.get("/api/tasks", async function(req, res){


    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(400).json({message: "Користувач не авторизований"})
    }
    const decodeData = jwt.verify(token, secret)
    console.log(decodeData.id)
    const tasks = await db.query("SELECT * FROM tasks WHERE user_id = $1", [decodeData.id]);
    if (tasks.rowCount == 0) {
        res.send('Завдання відсутні');
    } else {res.send(tasks.rows);
    }
});

app.post("/api/tasks", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const taskName = req.body.name;
    const taskDescription = req.body.descriptions;
    const taskDeadline = req.body.deadlines;
    const taskPriority = req.body.prioritys;
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(400).json({message: "Користувач не авторизований"})
    }
    const decodeData = jwt.verify(token, secret)
    const userId = decodeData.id
    console.log(taskDeadline);
    const newTask = await db.query("INSERT INTO tasks(name, descriptions, deadlines, prioritys, user_id) values($1, $2, $3, $4, $5) RETURNING *", [taskName, taskDescription, taskDeadline, taskPriority, userId]);
    // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    res.send(newTask);
});

app.post("/api/register", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const userName = req.body.name;
    const userLastname = req.body.lastname;
    const userLogin = req.body.login;
    const userPassword = req.body.password;
    const candidate = await db.query("SELECT * FROM users WHERE login = $1", [userLogin])
    if (!candidate.rowCount == 0){
        return res.status(400).json({message: "Користувач уже зареєстрований"})
    }
    const hashPassword = await bcrypt.hash(userPassword, 7);

    const newUser = await db.query("INSERT INTO users(name, lastname, login, password) values($1, $2, $3, $4) RETURNING *", [userName, userLastname, userLogin, hashPassword]);

    // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    res.json({message: `Користувача ${userName} ${userLastname} створено`});
});

app.post("/api/login", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const login = req.body.login;
    const password = req.body.password;
    const user = await db.query("SELECT * FROM users WHERE login = $1", [login])
    console.log(user.rows[0].password);
    if (!user.rowCount){
        return res.status(400).json({message: "Користувач не зареєстрований"})
    }
    const validatePassword = bcrypt.compareSync(password, user.rows[0].password)
    if (!validatePassword){
        return res.status(400).json({message: "Неправельний пароль"})
    }
    const token = generateAccessToken(user.rows[0].id)
    res.json({token})
});

app.patch('/api/tasks/:id', async function (req, res){

    if (!req.params) return res.sendStatus(400);

    const taskId = Number(req.params.id);
    const changeTask = await db.query('UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *', [true, taskId]);
    res.send(changeTask);

})

app.put('/api/tasks/descriptions/:id', jsonParser, async function (req,res){

    if (!req.params) return res.sendStatus(400);
    const taskId = req.params.id;
    const description = req.body.descriptions;
    let changeDescription = await db.query('UPDATE tasks SET descriptions = $1 WHERE id = $2 RETURNING *', [description, taskId]);
    res.send(changeDescription)
})

app.delete('/api/tasks/:id', async function(req, res){

    if(!req.params) return res.sendStatus(400);

    const task_id = req.params.id;
    let task = await db.query('DELETE FROM tasks WHERE id = $1  RETURNING *', [task_id]);
    res.send(task.rows[0]);
});


app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});