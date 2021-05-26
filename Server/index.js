const modules = require(`./modules.js`)

// Calculate time to midnight, and set a delay to run functions that need to be run every day
let now = new Date(),
midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0),
difference = midnight.getTime() - now.getTime() // Amount of milliseconds to midnight the next day

console.log(`${difference / 3600000} hours 'till update.`)

modules.updateCoronaData()

setTimeout(() => {
    setInterval(() => modules.dailyUpdate(), 86400000) // Loop "modules.dailyUpdate()" every 24 hours
    modules.dailyUpdate()
}, difference)