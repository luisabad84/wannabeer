let allBreweriesList = []

// function takes in response from calling geolocation API and runs if it is sucessful
function success(pos) {
    // setting crd(coord) to the coords respose gotten from geolocation API
    let crd = pos.coords;

    // console logging all values in pos.coords to see what the data is
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    
    // sets the long and lat of users location so we can access later
    let lnglat = [crd.longitude, crd.latitude];
    // saves the users coords in local storage so they can be accessed by other functions
    localStorage.setItem("userCoords", lnglat);
    // console log lnglat to make sure the data is in form we wanted
    console.log(lnglat);
    
    // this calls our map api and returns a map based on our criteria
    mapboxgl.accessToken = 'pk.eyJ1IjoiamJvZXJuZXI1NiIsImEiOiJjanQ5enp3OW0wMTBnNDRwNGRxOHN4OWczIn0.R8Q3ymvlpjg6gyshPanT0Q';
    // give the map from the API a name so we can edit the options
    let map = new mapboxgl.Map({
        // Sets the container the map will go in
        container: 'map',
        // sets the style and settings of our map
        style: 'mapbox://styles/mapbox/streets-v11',
        // default center for where the map loads
        center: lnglat,
        // amount of default zoom that the map will load with
        zoom: 12,
    });
    

    // function that takes in page number and then returns url to fetch that pages information from API
    function urlForThePage(pageNumber = 0) {
        // returns the default api needed to fetch data from OpenBrewery, inserts the page number so we can grab all data not just first page
        return `https://api.openbrewerydb.org/breweries?page=${pageNumber}&per_page=50`
    }
    
    
    // Takes in theActualData (response from Brewery API) then adds the information to allBreweriesList
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
    
    // function that will load brewery infomation by grabbing it out of local storage then parsing info back to array
    function loadBreweries() {
        // create variable to hold the data taken from breweries-data in local storage
        const jsonBreweries = localStorage.getItem("breweries-data");
        // sets variable to hold JSON parsed data from dreweries-data so we can use it (change it back to array from string it was turned into to store in local)
        const arrayOfBreweries = JSON.parse(jsonBreweries)
        // returns the parsed response so we can now use this data
        return arrayOfBreweries
    }
    
    // Takes in a page number and then fetches or requests that page from the breweries API
    function retrievePageOfBreweries(pageNumber){
        // fetches data from Brewery API, takes urlForThePage(pageNumber) as inputs, urlforpage is the function that generates our urls needed to fetch
        // the page number represents the specific page of data that is being taken as the API only allows us to grab 50 results at a time per page
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
    
    // function takes object from brewery api and draws the name of that object to our state brewery list at bottom of page
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
    
    // stores the breweries API data we fetched into local storage so we can access it later
    function storeBreweries(arrayOfBreweries) {
        // sets variable to hold the arrayOfBreweries, the JSON response from fetching API, and turns it to a string (puts "" around it) so it can be stored
        const jsondata = JSON.stringify(arrayOfBreweries);
        // stores all the brewery data into local storage under breweries-data
        localStorage.setItem("breweries-data", jsondata)
    }

    
    // function to add a single pin to the map which represents a breweries location, it takes in a single breweryObject   
    function addSinglePinToMap(breweryObject){
        // sets variable for longitude of the brewery object
        let breweryLng = breweryObject.longitude;
        // sets variable to hold latitude for the brewery object
        let breweryLat = breweryObject.latitude;
        // sets variable to hold lng and lat in format we need so we can use this variable in order to add a marker at that loction to the map
        let breweryLocation = [breweryLng, breweryLat]
        // sets variable to represent our markers on the map
        let marker = new mapboxgl.Marker()
        // sets the lng and lat of the brewery so the map knows where the pin goes
            .setLngLat(breweryLocation)
            // enables us to have a popup window when a marker is clicked
            .setPopup(new mapboxgl.Popup({offset:5})
            // sets the test of the popup box on the map
            .setHTML('<h3>' + breweryObject.name + '</h3><p>' + breweryObject.street + '</p>' + breweryObject.city + ', ' + breweryObject.state +'</p><p><a href= "' + breweryObject.website_url + '">' + breweryObject.website_url + '<a/></p>'))
            // adds the marker to the map
            .addTo(map);
        }

        // function that takes in allbrewerieslist and runs addSinglePinToMap for each of the objects
        function addAllPinsToMap(breweries=allBreweriesList){
            // calls singlepinto map for every object in brewery list so every brewery that has lng and lat in that list will be added to page
            breweries.forEach(addSinglePinToMap);
        }


    // function that adds geolocation capabilities to the map
    function geoLocateUser(){
        // adds control features for user for the map
        let map1 = map.addControl(new mapboxgl.GeolocateControl({
            // sets the options for how the geolocation will work with map
            positionOptions: {
                // this enables the geotracking to get as accurate info as possible not as quick as possible
                enableHighAccuracy: true
            },
            // enables button on map that if selected  the users location will be tracked and updated in map
            trackUserLocation: true,
            // enables user to click button and show a dot of themselves and will track them
            showUserLocation: true
        }));
        console.log(map1)
    }

    // main function that will call our other functions and ensure order is correct
    function main() {
        // sets variable to loadBreweries function so we can load the information from local storage
        let breweriesInLocalStorage = loadBreweries();
        // if the above is true aka we already have local storage data of the breweries 
        if (breweriesInLocalStorage) {
            // we set allBreweriesList to equal data from breweriesInLocalStorage
            allBreweriesList = [
                ...breweriesInLocalStorage
            ];
            drawListOfBreweries();
        } else {
            // for loop representing the maximum total pages so we can grab all the pages info
            for (pageNumber= 0; pageNumber <= 161 ; pageNumber++) {
                // calls retrievePageOfBreweries which takes pageNumber to actually get the data from BreweriesAPI
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
// calls the geolocation API to ask the user for their geolocation data, takes in success, which represents a sucessful retreval of the geolocation data
// this starts our code and is first thing needed as if we dont have userposition we cannot do what is needed.
navigator.geolocation.getCurrentPosition(success);

