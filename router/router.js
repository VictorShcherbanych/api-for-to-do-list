const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const database = require('../models/users')
const middleware = require('../middleware')
const { check, validationResult } = require ('express-validator')
require('dotenv').config()
const router = express();

const jsonParser = express.json();

const generateAccessToken = (id) => {
    try {
        const payload = {id};
        return jwt.sign(payload, process.env.SECRET, {expiresIn: "1h"})
    } catch (e){
        concole.log(e)
}}
  
router.get("/api/tasks" ,jsonParser, middleware, async function(req, res){
    try {
        const pageNumber = req.query.page
        const elements = Number(req.query.elements)
        const userId = req.user.id
        let offset = 0
        if (pageNumber){
            offset = Number(pageNumber)*elements-elements
        }
        res.json(await database.getTasks(userId, elements, offset));
    } catch (e) {
        console.log(e)}
});

router.post("/api/tasks", jsonParser, middleware, async function (req, res) {
         try{
        if(!req.body) return res.sendStatus(400);
        const taskName = req.body.name;
        const taskDescription = req.body.descriptions;
        const taskDeadline = req.body.deadlines;
        const taskPriority = req.body.prioritys;
        const userId = req.user.id;
                // const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
        res.json(await database.postTask(taskName, taskDescription, taskDeadline, taskPriority, userId));
    } catch (e) {
        console.log(e)
}
});

router.post("/api/register", jsonParser,[  
    check('login', 'Поле логіну не може бути порожнім').notEmpty(),
    check('password', 'Пароль повинен мати від 4 до 12 символів').isLength({min:4, max:12})
    ], async function (req, res) {
    try{    
        console.log(req.body.login) 
        if(!req.body) return res.sendStatus(400);
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: 'Помилка при реєстрації', errors})
        }
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

router.post("/api/login", jsonParser, async function (req, res) {
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

router.patch('/api/tasks', jsonParser, middleware, async function (req, res){
    try{
        if (!req.body) return res.sendStatus(400);
        const userId = req.user.id
        const taskId = req.body.id;
        res.json(await database.doneTask(userId, taskId));
    } catch (e) {
        console.log(e)
    }
})

router.put('/api/tasks/descriptions', jsonParser, middleware, async function (req,res){
    try{
        if (!req.params) return res.sendStatus(400);
        const userId = req.user.id;
        const taskId = req.body.id;
        const description = req.body.descriptions;
        res.json(await database.updateDescription(description, taskId, userId));
    } catch (e) {
        console.log(e)
    }   
})

router.delete('/api/tasks', jsonParser,  middleware, async function(req, res){
    try{
        if(!req.params) return res.sendStatus(400);
        const userId = req.user.id
        const taskId = req.body.id;
        res.json(await database.deleteTask(taskId, userId));
    } catch (e) {
        console.log(e)
    }
});

module.exports = router