//console.log("testing 123")

let allBreweriesList = []

function urlForThePage(pageNumber = 0) {
    return `https://api.openbrewerydb.org/breweries?page=${pageNumber}&per_page=50`
}

function acumilateBreweries(theActualData) {
    console.log(theActualData);
    allBreweriesList = [
        ...allBreweriesList, 
        ...theActualData
    ];
    storeBreweries(allBreweriesList);
}

function loadBreweries() {
    const jsonBreweries = localStorage.getItem("breweries-data");

    const arrayOfBreweries = JSON.parse(jsonBreweries)
    return arrayOfBreweries
}

function retrievePageOfBreweries(pageNumber){
    fetch(urlForThePage(pageNumber))
    .then(function (response) {
        return response.json()
    }) 
    .then(acumilateBreweries)
}

function storeBreweries(arrayOfBreweries) {
    const jsondata = JSON.stringify(arrayOfBreweries);
    localStorage.setItem("breweries-data", jsondata)
}

function main() {
    let breweriesInLocalStorage = loadBreweries();
    if (breweriesInLocalStorage) {
        allBreweriesList = [
            ...breweriesInLocalStorage
        ];
    } else {
        for (pageNumber= 0; pageNumber <= 161 ; pageNumber++) {
            retrievePageOfBreweries(pageNumber);
        }
    }
}
main()

