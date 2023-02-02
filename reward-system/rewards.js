const database = require('../models/users')

const lvl = {
    10: 1,
    50: 2,
    100: 3,
    200: 4,
    300: 5,
    450: 6,
    600: 7,
    750: 8,
    860: 9,
    1000: 10
}

module.exports = {
    getReward: async function getReward (userId) {
            let points = await database.getPoints(userId)
            let oldlvl = await database.getLVL(userId)
            if (!lvl[points]) {
                return oldlvl
            }
            newLVL = await database.newLVL(lvl[points], userId)
            return lvl[points] 
}
}
