const node_fetch = require("node-fetch"),
fs = require("fs"),
data = require("//WOLF/homes/www/Websites/CoronaNews/json/data.json"),
history = require(`//WOLF/homes/www/Websites/CoronaNews/json/history.json`);

/**
 * Pull latest data from APIs, and organise it into ./json/data.json
 */
module.exports.updateCoronaData = async () => {
    // Fetch from APIs
    let all = await node_fetch(`https://corona.lmao.ninja/v2/all`);
    all = await all.json();

    let countries = await node_fetch(`https://corona.lmao.ninja/v2/countries`);
    countries = await countries.json();

    let counties = await node_fetch(`https://corona.lmao.ninja/v2/jhucsse/counties`) 
    counties = await counties.json()

    let states = await node_fetch(`https://corona.lmao.ninja/v3/covid-19/states`);
    states = await states.json()

    // Change a copy of data.json acordingly, in desired format
    data.all = {
        cases: all.cases,
        casesToday: all.todayCases,
        deaths: all.deaths,
        deathsToday: all.todayDeaths,
        recovered: all.recovered,
        critical: all.critical,
        casesPerOneMillion: all.casesPerOneMillion,
        deathsPerOneMillion: all.deathsPerOneMillion,
        tests: all.tests,
        testsPerOneMillion: all.testsPerOneMillion
    }

    // If there's no countries object in the data, make one
    if (!data.countries) data.countries = {}
    // Do the same for states
    if (!data.states) data.states = {}

    let unsortedData = {}
    // Plug each country's data into this countries object, deleting unneeded values (and putting it in the format I want)
    countries.forEach(countryData => {
        countryName = countryData.country
        delete countryData.country
        delete countryData.continent
        delete countryData.updated

        countryData.countryInfo = {
            iso2: countryData.countryInfo.iso2,
            iso3: countryData.countryInfo.iso3,
            flag: countryData.countryInfo.flag
        }

        switch (countryName) {
            case "UK":
                countryName = "United Kingdom"
                countryData.otherNames = ["UK", "Great Britain"]
                break;
            
            case "USA": 
                countryName = "United States"
                countryData.otherNames = ["America", "USA"]
                break;
            
            case "S. Korea":
                countryName = "South Korea"
                break;

            case "UAE":
                countryName = "United Arab Emirates"
                countryData.otherNames = ["UAE"]
        }

        if (countryData.countryInfo.iso2 && countryData.countryInfo.iso3) unsortedData[countryName] = countryData
    })

    // Loop through all states, and organise their data
    states.forEach(stateData => {
        // Find all this state's counties
        let stateCounties = counties.filter(x => {return x.province.toLowerCase() == stateData.state.toLowerCase()})

        if (stateCounties.length != 0) {
            // Add info on this state
            data.states[stateData.state] = {
                all: {
                    cases: stateData.cases,
                    casesToday: stateData.todayCases,
                    deaths: stateData.deaths,
                    deathsToday: stateData.todayDeaths,
                    recovered: stateData.recovered,
                    active: stateData.active,
                    casesPerOneMillion: stateData.casesPerOneMillion,
                    deathsPerOneMillion: stateData.deathsPerOneMillion,
                    tests: stateData.tests,
                    testsPerOneMillion: stateData.testsPerOneMillion,
                    population: stateData.population
                },
                counties: {}
            }
            stateCounties.forEach(d => {
                // default values which will be added to for the individual county
                let cases = 0, deaths=0, recovered=0
                if (d.stats) cases = d.stats.confirmed, deaths = d.stats.deaths, recovered = d.stats.recovered;

                // Set statistics for individual county, or 0, if they're not found
                data.states[stateData.state].counties[d.county] = {
                    cases: cases,
                    deaths: deaths
                }
            })
        }
    })

    // Sort countries in order of name A-Z
    sortedCountries = Object.keys(unsortedData).sort()

    // Put the unsorted data into the actual data in alphabetical order
    sortedCountries.forEach(countryName => {
        data.countries[countryName] = unsortedData[countryName]
    })

    // Overwrite new changes to data.json
    fs.writeFileSync(`//WOLF/homes/www/Websites/CoronaNews/json/data.json`, JSON.stringify(data, null, 4));
}

/**
 * Update particular daily stats for the history graphs.
 * Runs at midnight GMT every day.
 */
module.exports.dailyUpdate = async function dailyUpdate () {
    await this.updateCoronaData();

    console.log(`(${new Date()})\nUpdating daily statistics...`)

    // If there are no dates, generate dates for last 30 days
    let d = new Date()
    if (!history.dates || history.dates.length != 30) {
        history.dates = []
        for (let i=0; i < 30; i++) {
            let date = new Date(d.setDate(d.getDate() - 1))

            day = date.getDate()
            if (day < 10) day = `0${day}`

            month = date.getMonth() + 1
            if (month < 10) month = `0${month}`

            history.dates[i] = `${day}/${month}/${date.getFullYear()}`
        }
    }
    else { // Otherwise, just add the new date (yesterday's date) and remove the one from 30 days ago
        date = new Date(d.setDate(d.getDate() - 1))

        day = date.getDate()
        if (day < 10) day = `0${day}`

        month = date.getMonth() + 1
        if (month < 10) month = `0${month}`

        history.dates.push(`${day}/${month}/${date.getFullYear()}`)
        history.dates.splice(0,1)
    }


    // Get all statistics by using Object.keys() on the global data
    let globalStats = Object.keys(data.all);

    globalStats.forEach(s => {
        if (!history[s]) history[s] = [data.all[s]]
        else if (history[s].length < 30) history[s].push(data.all[s])
        else {
            history[s].push(data.all[s]) // Add new value
            history[s].splice(0,1) // then delete the value from 30 days ago.
        }
    })

    if (!history.countries) history.countries = {}
    for (let countryName in data.countries) {
        // Get all country statistics
        let countryStats = Object.keys(data.countries[countryName])

        // Delete "countryInfo" since it's not a statistic
        countryStats.splice(0,1)

        countryStats.forEach(s => {
            if (!history.countries[countryName]) history.countries[countryName] = {}

            if (!history.countries[countryName][s]) history.countries[countryName][s] = [data.countries[countryName][s]]
            else if (history.countries[countryName][s].length < 30) history.countries[countryName][s].push(data.countries[countryName][s])
            else {
                history.countries[countryName][s].push(data.countries[countryName][s])
                history.countries[countryName][s].splice(0,1)
            }
        })
    }

    fs.writeFileSync(`//WOLF/homes/www/Websites/CoronaNews/json/history.json`, betterStringify(history))
}

module.exports.reverseDailyUpdate = function reverseDailyUpdate() {
    globalStats = Object.keys(data.all);

    // globalStats.forEach(s => {
    //     if (history[s]) {
    //         history[s].pop()
    //     }
    // })

    for (let countryName in data.countries) {
        let countryStats = Object.keys(data.countries[countryName])

        countryStats.splice(0,1)

        countryStats.forEach(s => {
            if (history.countries[countryName] && history.countries[countryName][s]) {
                history.countries[countryName][s].pop()
            }
        })
    }

    fs.writeFileSync(`//WOLF/homes/www/Websites/CoronaNews/json/history.json`, betterStringify(history))
}

/**
 * Stringify a JSON object but make arrays display on only one line.
 * @param {Object} json JSON object to make string from
 * @returns {String}
 */
function betterStringify(json) {
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
    output = JSON.stringify(json, function(k,v) {
      if(v instanceof Array)
        return JSON.stringify(v);
      return v;
    }, 4).replace(/\\/g, '')
          .replace(/\"\[/g, '[')
          .replace(/\]\"/g,']')
          .replace(/\"\{/g, '{')
          .replace(/\}\"/g,'}');
  
    return output;
  }