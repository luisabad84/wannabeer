let allBreweriesList = []

// function that takes in geolocation position data and returns the lng and lat of the position
function success(pos) {
    let crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    
    let lnglat = [crd.longitude, crd.latitude];
    console.log(lnglat);
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiamJvZXJuZXI1NiIsImEiOiJjanQ5enp3OW0wMTBnNDRwNGRxOHN4OWczIn0.R8Q3ymvlpjg6gyshPanT0Q';
    let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    // default center for where the map loads

    center: lnglat,
    zoom: 12,
    });
    


    function urlForThePage(pageNumber = 0) {
        return `https://api.openbrewerydb.org/breweries?page=${pageNumber}&per_page=50`
    }
    
    
    // Takes in theActualData then adds the information to allBreweriesList
    function acumilateBreweries(theActualData) {
        console.log(theActualData);
        allBreweriesList = [
            ...allBreweriesList, 
            ...theActualData
        ];
        // use allBreweriesList which contains Brewery API Data and calls the store function to store data in local storage
        storeBreweries(allBreweriesList);
    
        // We know there are no more breweries to load
        // when the API sends us empty array
        if (theActualData.length === 0) {
            // when all breweries info has been stored call main function again
            main();
        }
    }
    
    function loadBreweries() {
        const jsonBreweries = localStorage.getItem("breweries-data");
        const arrayOfBreweries = JSON.parse(jsonBreweries)
        return arrayOfBreweries
    }
    
    // Takes in a page number and then fetches or requests that page from the breweries API
    function retrievePageOfBreweries(pageNumber){
        fetch(urlForThePage(pageNumber))
        // returns the fetch response and converts to json
        .then(function (response) {
            return response.json()
        }) 
        // calls accumulateBreweries function to add all Brewery API pages data allBreweriesList
        .then(acumilateBreweries)
    }
    
    // function takes object from brewery api and pulls its info to display
    function drawBreweryDataToDetail(breweryObject) {

        const detailArea = document.querySelector('[data-brewery]');
        detailArea.textContent = '';

        const breweryName = document.createElement('div');
        const breweryType = document.createElement('div');
        const breweryStreet = document.createElement('div');
        const breweryState = document.createElement('div');
        const breweryZip = document.createElement('div');
        const breweryPhone = document.createElement('div');
        const breweryWebsite = document.createElement('div');
        debugger;
        breweryName.textContent = `Name: ${breweryObject.name}`;
        breweryType.textContent = `Type: ${breweryObject.brewery_type}`;
        breweryStreet.textContent = `Street: ${breweryObject.street}`;
        breweryState.textContent = `State: ${breweryObject.state}`;
        breweryZip.textContent = `Zip Code: ${breweryObject.postal_code}`;
        breweryPhone.textContent = `Phone Number: ${breweryObject.phone}`;
        breweryWebsite.textContent = `Website: ${breweryObject.website_url}`;
            
        detailArea.appendChild(breweryName);
        detailArea.appendChild(breweryType);
        detailArea.appendChild(breweryStreet);
        detailArea.appendChild(breweryState);
        detailArea.appendChild(breweryZip);
        detailArea.appendChild(breweryPhone);
        detailArea.appendChild(breweryWebsite);
    }
    
    // function takes object from brewery api
    function drawSingleBreweryListByStateToList(breweryObject) {
        // from the object we grab the breweries name
        const breweryName = breweryObject.name;
        // // if brewery doesnt have a name or it cant be pulled we returns nothing 
        // if (breweryName.length === 0) {
        //     return;
        // }
        // creating a new anchor element and setting the element name
        const anchorElement = document.createElement('li');
        // set the new elements text to the name of the brewery
        anchorElement.textContent = breweryName;
    
        // we need to add ability to click on those names and have the details pull up
        anchorElement.addEventListener('click', function () {
            drawBreweryDataToDetail(breweryObject);
        });
        const listItem = document.createElement('li');
        listItem.appendChild(anchorElement);

        const listArea = document.querySelector('[data-detail]');
        listArea.appendChild(listItem);
    }
    function drawListOfBreweries(breweries=allBreweriesList){
        const listArea = document.querySelector('[data-brewery]');
        listArea.textContent = '';
        breweries.forEach(drawSingleBreweryListByStateToList);
    }
    
    // function drawBreweryListByStateToList(breweries=allBreweriesList) {
    //     console.log(breweryObject)
    //     const listArea =  where the names list by state will be drawn
    //     breweries.forEach(drawSingleBreweryListByStateToList)
    // }
    
    // stores the breweries APU data in local storage
    function storeBreweries(arrayOfBreweries) {
        const jsondata = JSON.stringify(arrayOfBreweries);
        localStorage.setItem("breweries-data", jsondata)
    }

    
    // adds pins for brewery onto map    
    function addSinglePinToMap(breweryObject){
        let breweryLng = breweryObject.longitude;
        let breweryLat = breweryObject.latitude;
        let breweryLocation = [breweryLng, breweryLat]
        let marker = new mapboxgl.Marker()
            .setLngLat(breweryLocation)
            .setPopup(new mapboxgl.Popup({offset:5})
            .setHTML('<h3>' + breweryObject.name + '</h3><p>' + breweryObject.street + '</p>' + breweryObject.city + ', ' + breweryObject.state +'</p><p><a href= "' + breweryObject.website_url + '">' + breweryObject.website_url + '<a/></p>'))
            .addTo(map);
        }

        function addAllPinsToMap(breweries=allBreweriesList){
            breweries.forEach(addSinglePinToMap);
        }


    
    function geoLocateUser(){
        let map1 = map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserLocation: true
        }));
        console.log(map1)
    }

    function main() {
        let breweriesInLocalStorage = loadBreweries();
        if (breweriesInLocalStorage) {
            allBreweriesList = [
                ...breweriesInLocalStorage
            ];
            drawListOfBreweries();
        } else {
            for (pageNumber= 0; pageNumber <= 161 ; pageNumber++) {
                retrievePageOfBreweries(pageNumber);
            }
        }
        addAllPinsToMap();
        geoLocateUser();
        // drawBreweryDataToDetail(allBreweriesList);
        drawSingleBreweryListByStateToList();
    }
    main();
}
navigator.geolocation.getCurrentPosition(success);

