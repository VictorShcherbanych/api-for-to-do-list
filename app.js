const express = require("express");
const fs = require("fs");
const db = require('./db')
    
const app = express();
const jsonParser = express.json();
  
app.use(express.static(__dirname + "/public"));
  

app.get("/api/tasks", async function(req, res){
    console.log(req.query.rank);

    if(!req.query.rank){
        const users = await db.query("SELECT * FROM tasks");
        res.send(users.rows);
    };
    if(req.query.rank){
    const rank = req.query.rank;
    console.log(rank);
    const tasks = await db.query('SELECT * FROM tasks WHERE ranks = $1', [rank]);
    console.log(tasks);
    res.send(tasks.rows);
    }
});

app.get("/api/tasks/:id", async function(req, res){

    if (!req.params) return res.sendStatus(400);
    
    const id = req.params.id;
    const task = await db.query("SELECT * FROM tasks WHERE id = $1", [id] );
    res.send(task.rows);
});


app.post("/api/tasks", jsonParser, async function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
    const taskName = req.body.name;
    const newTask = await db.query("INSERT INTO tasks(name) values($1) RETURNING *", [taskName]);
    console.log(newTask);
    // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))

    res.send(newTask);
});


app.patch('/api/tasks/:id', async function (req, res){

    if (!req.params) return res.sendStatus(400);

    const taskId = Number(req.params.id);
    console.log(taskId);
    let task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const change_task = await db.query('UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *', [true, taskId]);
    res.send(task.rows);

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