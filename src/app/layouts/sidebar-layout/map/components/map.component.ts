import { Component, OnInit } from '@angular/core';
import { TileLayer, XYZ, Map, View } from 'src/app/core/modules/openlayers';

export const map = new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F1dHk5NiIsImEiOiJjanN4aDd2cG8wMmw3NDRwaDc2cnc2OXJwIn0.YRVVo-3FkQtfkMPH4lt2hw',
        attributionsCollapsible: false,
        attributions: '  © contributeurs <a target="_blank" href="https://www.openstreetmap.org/copyright"> OpenStreetMap </a>  '
      })
    })
  ],

  view: new View({
    center: [0, 0],
    zoom: 6
  })
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.initialiazeMap();
  }

  initialiazeMap() {
    map.setTarget('map');
  }
}
