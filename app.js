const express = require("express");
const db = require('./db');
    
const app = express();
const jsonParser = express.json();
  
app.use(express.static(__dirname + "/public"));
  
app.get("/api/tasks", async function(req, res){

    const tasks = await db.query("SELECT * FROM tasks");
    if (tasks.rowCount == 0) {
        res.send('Завдання відсутні');
    } else {res.send(tasks.rows);
        console.log(tasks.rows)
    }
});

app.get("/api/tasks/:id", async function(req, res){

    if (!req.params) return res.sendStatus(400);
    
    const id = req.params.id;
    const task = await db.query("SELECT * FROM tasks WHERE id = $1", [id] );
    res.send(task.rows);
});

app.get("/api/users", async function(req, res){

    const users = await db.query("SELECT * FROM tasks");
    if (tasks.rowCount == 0) {
        res.send('Завдання відсутні');
    } else {res.send(tasks.rows);
        console.log(tasks.rows)
    }
});

app.post("/api/tasks", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const taskName = req.body.name;
    const taskDescription = req.body.descriptions;
    const taskDeadline = req.body.deadlines;
    const taskPriority = req.body.prioritys;
    console.log(taskDeadline);
    const newTask = await db.query("INSERT INTO tasks(name, descriptions, deadlines, prioritys) values($1, $2, $3, $4) RETURNING *", [taskName, taskDescription, taskDeadline, taskPriority]);
    // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    res.send(newTask);
});

app.post("/api/creataccount", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const userName = req.body.name;
    const userLastname = req.body.lastname;
    const userLogin = req.body.login;
    const userPassword = req.body.password;
    console.log(userPassword)
    const newUser = await db.query("INSERT INTO users(name, lastname, login, password) values($1, $2, $3, $4) RETURNING *", [userName, userLastname, userLogin, userPassword]);
    // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    res.send(newUser.rows);
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