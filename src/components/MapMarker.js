import React from 'react';
import Icon from '@ant-design/icons';

const MapMarker = (({ name, key }) => {
  return (
    <div key={key}>
      <span className="brand-red">{name}</span>
      <Icon className="font-1-5" type="environment" theme="twoTone" twotonecolor="#fd0000" />
    </div>
  );
});

export default MapMarker;
