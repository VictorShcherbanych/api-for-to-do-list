const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    password: "255477",
    host: "localhost",
    port: 5432,
    database: 'gob'
})
module.exports = pool