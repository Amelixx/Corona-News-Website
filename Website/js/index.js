/**
 * Executes once the webpage has loaded.
 */
function onLoad () {
    // Get JSON
    $.getJSON("json/data.json", (data) => {
        // Edit values
        $(".global-cases").html(`${data.all.cases.toLocaleString()} Cases`);
        $(".global-recovered").html(`${data.all.recovered.toLocaleString()} Recovered`);
        $(".global-deaths").html(`${data.all.deaths.toLocaleString()} Deaths`);
    })
    loadCharts()
}

/**
 * Generates both of the charts on the home page using Chart.js.
 */
function loadCharts () {
    $.getJSON("./json/history.json", (history) => {
        let globalCaseHistory = document.getElementById(`global-case-history`).getContext('2d'),
        mostAffectedCountries = document.getElementById(`most-affected-countries-30-days`).getContext('2d'),
    
        labels = numbers(30)
    
        new Chart(globalCaseHistory, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Global Cases (Last 30 days)",
                    borderColor: 'rgb(58, 85, 146)',
                    data: history.cases
                }]
            },

            options: {
                maintainAspectRatio: false
            }
        })

        let topCountries = Object.keys(history.countries).sort((a,b) => {
            return history.countries[b].cases.reduce((a,b) => a + b, 0) - history.countries[a].cases.reduce((a,b) => a + b, 0)
        }).slice(0, 10),
        datasets = [],
        colours = [`#0071D1`, `#63B300`, `#E6990E`, `#912FC0`, `#D43659`, `#0B7567`, `#F76EBB`, `#F2C428`, `#00B4A2`, `#5B54D5`]

        topCountries.forEach((name, i) => {
            datasets.push({
                label: name,
                borderColor: colours[i],
                data: history.countries[name].cases
            })
        })

        new Chart(mostAffectedCountries, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },

            options: {
                maintainAspectRatio: false
            }
        })
    })
}

/**
 * Generates an array of all numbers from 1 to "end".
 * @param {Number} end 
 */
function numbers (end) {
    let arr = [];
    for (let i=1; i <= end; i++) {
        arr.push(i);
    }
    return arr;
}