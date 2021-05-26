$(document).ready(() => {
    $.getJSON("json/data.json", (data) => {
        let lastCountries = Object.keys(data.countries),
        countryHTML = {},
        container = document.getElementById("cardContainer"),
        html = ""

        for (let c in data.countries) {
            let info = data.countries[c],
            card = `<div class="card" id="${info.countryInfo.iso2}"><div class="cardHeader"><h1 class="cardTitle">${c}</h1><img class="cardFlag" src="${info.countryInfo.flag}"></div>
                    <p class="cardInfo">Cases: ${info.cases.toLocaleString()}<br>Deaths: ${info.deaths.toLocaleString()}<br>Recovered: ${info.recovered.toLocaleString()}<br>
                    Active: ${info.active.toLocaleString()}<br>Critical: ${info.critical.toLocaleString()}<br>Population: ${info.population.toLocaleString()}<br>
                    ${Math.round(info.casesPerOneMillion / 1000000 * 10000) / 100}% Infected<br>${Math.round(info.deathsPerOneMillion / 1000000 * 10000) / 100}% Dead</p></div>`
            html += card

            countryHTML[info.countryInfo.iso2] = card
        }
        container.innerHTML = html

        let searchBox = $("#searchBox")
        searchBox.on("input", () => {
            let countries = filterStates(searchBox.val(), data.countries)

            // Delete all countries in HTML and save their HTMLs
            lastCountries.forEach(c => {
                document.getElementById(data.countries[c].countryInfo.iso2).remove()
            })

            lastCountries = countries
            let html = ""
            countries.forEach(c => {
                html += countryHTML[data.countries[c].countryInfo.iso2]
            })
            container.innerHTML = html
        })
    })
})

/**
 * Finds countries that match certain aspects of "search", such as name, ISO codes, etc.
 * @param {String} search The input to filter countries with.
 * @param {object} data Countries data
 * @returns {Array<string>} name of all countries matching the search
 */
function filterStates (search, data) {
    if (!search) return Object.keys(data);
    search = search.toUpperCase();

    let countries = Object.keys(data),
    arr1 = [], arr2 = [], arr3 = [];
    countries.forEach(c => {
        if (data[c].otherNames) {
            for (let i in data[c].otherNames) {
                n = data[c].otherNames[i].toUpperCase();
                if (n.startsWith(search)) arr2.push(c);
                else if (n.includes(search)) arr3.push(c);
            }
        }

        let name = c.toUpperCase();

        if (data[c].countryInfo.iso2 == search || data[c].countryInfo.iso3 == search) arr1.push(c);
        else if (name.startsWith(search)) arr2.push(c);
        else if (name.includes(search)) arr3.push(c);
    })

    return [...arr1, ...arr2, ...arr3]
}