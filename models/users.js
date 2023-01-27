const db = require('../db');

module.exports = {
    getTasks: async function getTasks (user_id, elements, offset) {
        try{
            const tasks = await db.query("SELECT * FROM tasks WHERE user_id = $1 LIMIT $2 OFFSET $3", [user_id.id, elements, offset])
            return tasks.rows
        } catch (e) {
            console.log(e)
        }
    },
    postTask: async function postTask (taskName, taskDescription, taskDeadline, taskPriority, userId) {
        try {
            const newTask = await db.query("INSERT INTO tasks(name, descriptions, deadlines, prioritys, user_id) values($1, $2, $3, $4, $5) RETURNING *", [taskName, taskDescription, taskDeadline, taskPriority, userId]);
            return newTask.rows
        }catch (e) {
            console.log(e)
        }
    },

    getUser: async function getUser (userLogin) {
        try{
            const candidate = await db.query("SELECT * FROM users WHERE login = $1", [userLogin]);
            return candidate
        } catch (e) {
            console.log (e)
        }
    },

    createUser: async function createUser (userName, userLastname, userLogin, hashPassword) {
        try{
            const newUser = await db.query("INSERT INTO users(name, lastname, login, password) values($1, $2, $3, $4) RETURNING *", [userName, userLastname, userLogin, hashPassword]);
            return newUser.rows
        } catch (e) {
            console.log(e)
        }
    },
    doneTask: async function doneTask (userId, taskId) {
        try{
            const done = await db.query('UPDATE tasks SET done = $1 WHERE user_id = $2 AND id = $3 RETURNING *', [true, userId, taskId])
            return done.rows
        } catch (e) {
            console.log(e)
        }
    },
    updateDescription: async function updateDescription (description, taskId, userId) {
        try{
            let updateDescription = await db.query('UPDATE tasks SET descriptions = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [description, taskId, userId]);
            return updateDescription.rows
        } catch (e) {
            console.log(e)
        }
    },
    deleteTask: async function deleteTask (taskId, userId) {
        try {
            const deleteTask = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2  RETURNING *' , [taskId, userId]);
            return deleteTask.rows[0]
        } catch (e) {
            console.log (e)
        }
    }

};