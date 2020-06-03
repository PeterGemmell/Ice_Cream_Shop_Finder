import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import MapAutoComplete from '../components/MapAutoComplete';
import MapMarker from '../components/MapMarker';
import PlaceCard from '../components/PlaceCard';
import ConstraintSlider from '../components/ConstraintSlider';
import Icon from '@ant-design/icons';

import { Button, Input, Divider, message } from 'antd';

const GLA_COOR = { lat: 55.8642, lng: -4.2518 };


class MapContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
    constraints: [{ name: '', time: 0}],
    searchResults: [],
    mapsLoaded: false,
    markers: [],
    map: {},
    mapsApi: {},
    glasgowLatLng: {},
    autoCompleteService: {},
    placesService: {},
    geoCoderService: {},
    directionService: {},
  };
  }

  // Update name for constraint with index === key.
  updateConstraintName = ((event, key) => {
    event.preventDefault();
    const prevConstraints = this.state.constraints;
    const constraints = Object.assign([], prevConstraints);
    constraints[key].name = event.target.value;
    this.setState({ constraints });
  });

  // Updates distance (in KM) for constraint with index == key.
  updateConstraintTime = ((key, value) => {
  const prevConstraints = this.state.constraints;
  const constraints = Object.assign([], prevConstraints);
  constraints[key].time = value;
  this.setState({ constraints });
});

// Adds a Marker to the GoogleMaps component.
addMarker = ((lat, lng, name) => {
  const prevMarkers = this.state.markers;
  const markers = Object.assign([], prevMarkers);      // THIS WORKS A MARKER IS ADDED.

// If name already exists in marker list just replace lat & lng.
let newMarker = true;
for(let i=0; i <markers.length; i++){
  if(markers[i].name === name){
    newMarker = false;
    markers[i].lat = lat;
    markers[i].lng = lng;
    message.success(`Updated "${name}" Marker`); // This works I think as we are getting or streets etc back.
    break;
  }
}
// Name does not exist in marker list. Create new marker.
if(newMarker) {
  markers.push({lat, lng, name});
  message.success(`Added new "${name}" Marker`); // THIS WORKS.
}

this.setState({markers});
});

// Runs once when the Google Maps library is ready.
// Initializes all services that we need.
apiHasLoaded = ((map, mapsApi) => {
  this.setState({
    mapsLoaded: true,
    map,
    mapsApi,
    glasgowLatLng: new mapsApi.LatLng(GLA_COOR.lat ,GLA_COOR.lng), // can remove parseFloat. MAYBE????
    autoCompleteService: new mapsApi.places.AutocompleteService(),
    placesService: new mapsApi.places.PlacesService(map),
    geoCoderService: new mapsApi.Geocoder(),
    directionService: new mapsApi.DirectionsService(),
  });
});

// With the constraints, find some places serving ice-cream.
handleSearch = (() => {
  const { markers, constraints, placesService, directionService, mapsApi } = this.state;
  if(markers.length === 0){
    message.warn('Add a constraint and try again!');
    return;
  }
  const filteredResults = [];
  const marker = markers[0];
  const timeLimit = constraints[0].time;
  const markerLatLng = new mapsApi.LatLng(marker.lat, marker.lng); // MAYBE ????

  const placesRequest = {
    location: markerLatLng,
    type: ['restaurant', 'cafe'],
    query: 'ice cream',
    rankBy: mapsApi.places.RankBy.DISTANCE,
  };

  // First, search for ice cream shops.
  placesService.textSearch(placesRequest, ((response) => {
  // Only look at the nearest top 5.
   const responseLimit = Math.min(5, response.length);
  for(let i=0; i < responseLimit; i++){
    const iceCreamPlace = response[i];
    const { rating, name } = iceCreamPlace;
    const address = iceCreamPlace.formated_address; // for example 5 Buchanan Street, Glasgow.
    const priceLevel = iceCreamPlace.price_level;
    let photoUrl = '';
    let openNow = false;
    if(iceCreamPlace.opening_hours){
      openNow = iceCreamPlace.opening_hours.isOpen(); // e.g true or false is it open. // CHANGED FROM open_now.
    }
    if(iceCreamPlace.photos && iceCreamPlace.photos.length > 0){
      photoUrl = iceCreamPlace.photos[0].getUrl();
    }

    // Second, For each iceCreamPlace, check if it is within acceptable travelling distance.
    const directionRequest = {
      origin: markerLatLng,
      destination: 'address', // Address of the ice cream place. ??????????????????????????ERROR MAY BE HERE.
      travelMode: 'DRIVING',
    }
     directionService.route(directionRequest, ((result, status) => {
      if(status !== 'OK') { return }
      const travellingRoute = result.routes[0].legs[0]; // { duration: { text: 1mins, value: 600 } }
      const travellingTimeInMinutes = travellingRoute.duration.value / 60;
      if(travellingTimeInMinutes < timeLimit){
        const distanceText = travellingRoute.distance.text; //for example 10kms away.
        const timeText = travellingRoute.duration.text; //for example its 15 mins away.
        filteredResults.push({
          name,
          rating,
          address,
          openNow,
          priceLevel,
          photoUrl,
          distanceText,
          timeText,
        });
      }
      // Finally, Add results to state.
      this.setState({ searchResults: filteredResults });
    }));
  }
 }));
});

render() {
   const { constraints, mapsLoaded, glasgowLatLng, markers, searchResults } = this.state;
   const { autoCompleteService, geoCoderService } = this.state; // Google Maps Services
   return (
     <div className="w-100 d-flex py-4 flex-wrap justify-content-center">
       <h1 className="w-100 fw-md"><b>Ice-Cream Finder</b> 🍦</h1>
       {/* Constraints section */}
       <section className="col-4">
         {mapsLoaded ?
           <div>
             {constraints.map((constraint, key) => {
               const { name, time } = constraint;
               return (
                 <div key={key} className="mb-4">
                   <div className="d-flex mb-2">
                     <Input className="col-4 mr-2" placeholder="Name" onChange={(event) => this.updateConstraintName(event, key)} />
                     <MapAutoComplete
                       autoCompleteService={autoCompleteService}
                       geoCoderService={geoCoderService}
                       glasgowLatLng={glasgowLatLng} // THIS MAY NOT BE RIGHT EITHER??
                       markerName={name}
                       addMarker={this.addMarker}
                     />
                   </div>
                   <ConstraintSlider
                     iconType="car"
                     value={time}
                     onChange={(value) => this.updateConstraintTime(key, value)}
                     text="Minutes away by car"
                   />
                   <Divider />
                 </div>
               );
             })}
           </div>
           : null
         }
       </section>

       {/* Maps Section */}
       <section className="col-8 h-lg">
       <GoogleMapReact
       bootstrapURLKeys={{
         key: '',
         libraries: ['places', 'directions']
       }}
       defaultZoom={11}
       defaultCenter={{ lat: GLA_COOR.lat, lng: GLA_COOR.lng }}
       yesIWantToUseGoogleMapApiInternals={true}
       onGoogleApiLoaded={({map, maps}) => this.apiHasLoaded(map, maps)} // maps is refering to the maps api.
       >
       {/* Pin markers on the Map*/}
       {markers.map((marker, key) => {
         const{ name, lat, lng } = marker;
         return(
           <MapMarker key={key} name={name} lat={lat} lng={lng} />
         );
       })}
       </GoogleMapReact>
       </section>

       {/* Search Button */}
       <Button className="mt-4 fw-md" type="primary" size="large" onClick={this.handleSearch}>Search!</Button>

       {/* Results section */}
       {searchResults.length > 0 ?
          <>
            <Divider />
            <section className="col-12">
              <div className="d-flex flex-column justify-content-center">
                <h1 className="mb-4 fw-md">Ice-Creams!</h1>
                <div className="d-flex flex-wrap">
                  {searchResults.map((result, key) => (
                    <PlaceCard info={result} key={key} />
                  ))}
                </div>
              </div>
            </section>
          </>
          : null}
      </div>
    )
  }



}


export default MapContainer;
