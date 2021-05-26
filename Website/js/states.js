$(document).ready(() => {
    $.getJSON("json/data.json", (data) => {
        let lastStates = Object.keys(data.states),
        stateHTML = {},
        container = document.getElementById("cardContainer"),
        html = ""

        for (let s in data.states) {
            let info = data.states[s],
            card = `<div class="card extra-glass" id="${s}"><div class="cardHeader"><h1 class="cardTitle">${s}</h1><img class="cardFlag" src="http://canis.dynu.com/~rubix/stateflags/${s.toLowerCase().split(" ").join("-")}.png"></div>
                    <p class="cardInfo">Cases: ${info.all.cases.toLocaleString()}<br>Deaths: ${info.all.deaths.toLocaleString()}<br>Recovered: ${info.all.recovered.toLocaleString()}<br>
                    Active: ${info.all.active.toLocaleString()}<br>Tests: ${info.all.tests.toLocaleString()}<br>Population: ${info.all.population.toLocaleString()}<br>
                    ${Math.round(info.all.casesPerOneMillion / 1000000 * 10000) / 100}% Infected<br>${Math.round(info.all.deathsPerOneMillion / 1000000 * 10000) / 100}% Dead</p></div>`
            html += card

            stateHTML[s] = card
        }
        container.innerHTML = html

        let searchBox = $("#searchBox")
        searchBox.on("input", () => {
            started = Date.now()
            let states = filterStates(searchBox.val(), data.states)

            // Delete all states in HTML and save their HTMLs
            lastStates.forEach(s => {
                document.getElementById(s).remove()
            })

            lastStates = states
            let html = ""
            states.forEach(s => {
                html += stateHTML[s]
            })
            container.innerHTML = html
            console.log(`${Date.now() - started}ms`)
        })
    })
})

/**
 * Finds states that match certain aspects of "search", such as name.
 * @param {String} search The input to filter countries with.
 * @param {object} data states data
 * @returns {Array<string>} name of all states matching the search
 */
 function filterStates (search, data) {
    if (!search) return Object.keys(data);
    search = search.toUpperCase();

    let states = Object.keys(data),
    arr1 = [], arr2 = [];
    states.forEach(s => {
        let name = s.toUpperCase();

        if (name.startsWith(search)) arr1.push(s);
        else if (name.includes(search)) arr2.push(s);
    })

    return [...arr1, ...arr2]
}