$(document).ready(() => { 
    $.getJSON("json/data.json", (data) => {
        let countryArray = Object.keys(data.countries)
        $("#cases").html(`${data.all.cases.toLocaleString()} Cases`)
        $("#casesToday").html(`${data.all.casesToday.toLocaleString()} Today`)
        $("#deaths").html(`${data.all.deaths.toLocaleString()} Deaths`)
        $("#deathsToday").html(`${data.all.deathsToday.toLocaleString()} Today`)
        $("#tests").html(`${data.all.tests.toLocaleString()} Tests`)
        $("#countries-affected").html(`${countryArray.length} Countries affected.`)

        createTable("cases")
    })
});

const stats = ["cases", "deaths", "recovered", "active", "critical", "casesPerOneMillion", "deathsPerOneMillion", "population"],
displayStats = ["Cases", "Deaths", "Recovered", "Active", "Critical", "Cases Per Million", "Deaths Per Million", "Population"]

let sortedStat = "",
reversed = false

/**
 * Creates a table of countries, and optionally sorts them by a particular statistic.
 * @param {String} stat Statistic to sort countries by in table
 */
function createTable(stat) {
    $.getJSON("json/data.json", (data) => {
        let countries = Object.keys(data.countries),
        sortFunction = (a,b) => {return data.countries[b][stat] - data.countries[a][stat]}

        if (!stat && !sortedStat && !reversed) {
            countries = countries.reverse() // If name stat is clicked twice, reverse the A-Z country order to make Z-A
            reversed = true
        }
        else {
            if (stat == sortedStat && !reversed) {
                // If same stat clicked twice, reverse the sortFunction
                sortFunction = (a,b) => {return data.countries[a][stat] - data.countries[b][stat]}
                reversed = true
            }
            else reversed = false 
            countries = countries.sort(sortFunction)
        }
        sortedStat = stat

        let nameClass = `item item-top`
        if (!stat) nameClass = "item item-top sorted"

        table = `
            <div class="entry" id="top">
            <div class="item" id="table-num">#</div>
            <div class="${nameClass}" onclick="createTable()">Name</div>`

        stats.forEach((s, i) => {
            let classes = "item item-top"
            if (stat && s == stat) classes += " sorted"
            table += `<div class="${classes}" onclick="createTable('${s}')">${displayStats[i]}</div>`
        })
        table += `</div>`

        countries.forEach((countryName, i) => {
            table += `<div class="entry"><div class="item" id="table-num">${i+1}</div><div class="item">${countryName}</div>`,
            countryData = data.countries[countryName]
            stats.forEach((stat, i) => {
                var num = countryData[stat],
                innerHTML = num.toLocaleString()
                // If the stat is cases per one million or deaths per one million calculate and add a percentage
                if (i == 5 || i == 6) innerHTML += `<br>(${Math.round(num / 1000000 * 10000) / 100}%)`
                table += `<div class="item">${innerHTML}</div>`
            })
            table += `</div>`
        })
        $("#country-table").html(table)
    })
}