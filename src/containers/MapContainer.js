import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import MapAutoComplete from '../components/MapAutoComplete';
import MapMarker from '../components/MapMarker';
import PlaceCard from '../components/PlaceCard';
import ConstraintSlider from '../components/ConstraintSlider';

import { Button, Input, Divider, message } from 'antd';

const GLA_COOR = { lat: 55.8642, lng: 4.2518 };


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

  






}
