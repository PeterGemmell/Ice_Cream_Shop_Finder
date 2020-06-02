import React, {Component} from 'react';
import './App.css';
import MapContainer from './containers/MapContainer.js'
import GoogleMapReact from 'google-map-react';

class App extends Component {

  render(){
    return(
      <div>
      <MapContainer />
      </div>
    );
  }
}

export default App;
