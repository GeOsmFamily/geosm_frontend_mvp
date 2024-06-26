import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { environment } from 'src/environments/environment';
import { select, Store } from '@ngrx/store';

import { Extent } from 'ol/extent';
import {
  BaseLayer,
  Feature,
  Fill,
  Polygon,
  Stroke,
  Style,
  Text,
  VectorLayer,
  VectorSource,
  transform
} from 'src/app/core/modules/openlayers';
import Map from 'ol/Map.js';
import { Observable } from 'rxjs';
import { MapState } from 'src/app/layouts/sidebar-layout/map/states/map.reducer';
import { selectIsLoading } from 'src/app/layouts/sidebar-layout/map/states/map.selector';

@Component({
    selector:'app-select-layout',
    templateUrl: './select-layout-component.html',
    styleUrls: ['./select-layout-component.scss']
})

export class SelectLayoutComponent implements OnInit{
    @Output() selectPlaceEvent = new EventEmitter<string>();
    selectedAirpod: string='';
    isLoading$!: Observable<boolean>;
    places:any[]=[
        {
            name:'Yaoundé-Nsimalen',
            id:0
        },
        {
            name:'Bamenda',
            id:1
        },
        {
            name:'Bertoua',
            id:2
        },
        {
            name:'Douala',
            id:3
        },
        {
            name:'Garoua',
            id:4
        },
        {
            name:'Maroua-Salak',
            id:5
        },
        {
            name:'Ngaoundéré',
            id:6
        }
    ];
    map!: Map;
    airpodLayer: BaseLayer = new VectorLayer({
    source: new VectorSource(),
    style: feature => {
      let textLabel;
      let textStyle = {
        font: '14px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#000', width: 1 }),
        offsetX: 0,
        offsetY: 0
      };
      if (feature.get('textLabel')) {
        textLabel = feature.get('textLabel');
        //@ts-ignore
        textStyle['text'] = textLabel;
        if (feature.getGeometry()?.getType() == 'Point') {
          textStyle.offsetY = 40;
          //@ts-ignore
          textStyle['backgroundFill'] = new Fill({ color: '#fff' });
        }
      }

      let color = '#ade36b';
      return new Style({
        fill: new Fill({
          color: [DataHelper.hexToRgb(color)!.r, DataHelper.hexToRgb(color)!.g, DataHelper.hexToRgb(color)!.b, 0.5]
        }),
        stroke: new Stroke({
          color: environment.primarycolor,
          width: 6
        }),
        text: new Text(textStyle)
      });
    },
    //@ts-ignore
    type_layer: 'airpodLayer',
    nom: 'airpodLayer'
  });

  constructor(
    private store: Store<MapState>
  ){
    this.isLoading$ = this.store.pipe(select(selectIsLoading));
  }

   async ngOnInit() {
      this.initialiseAirpodLayer();
      
    }

    initialiseAirpodLayer() {
        let mapHelper = new MapHelper();
        if (mapHelper.getLayerByName('airpodLayer').length > 0) {
          this.airpodLayer = mapHelper.getLayerByName('airpodLayer')[0];
          this.airpodLayer.setZIndex(2000);
        } else {
          this.airpodLayer.setZIndex(2000);
          mapHelper.map?.addLayer(this.airpodLayer);
        }
        if (mapHelper.getLayerByName('airpodLayer').length > 0) {
          mapHelper.getLayerByName('airpodLayer')[0].getSource().clear();
        }
      }

    async setPlace(event: any){
      const reponseData  = await fetch('../../../../../assets/adc-data/Aeroports_du _Cameroun_ADC.geojson');
      const adcData = await reponseData.json();

      let selectedSite = adcData.features[event.target.value];
      let mapHelper = new MapHelper();
      mapHelper.clearLayerOnMap('airpodLayer');
      this.selectPlaceEvent.emit();
      setTimeout(() => {
        this.selectAirPod(selectedSite);
      }, 500);
    }

    selectAirPod(selectedSite: any){
      let mapHelper = new MapHelper();
      if (mapHelper.getLayerByName('airpodLayer').length > 0) {

          let feature = new Feature();
          let textLabel = selectedSite.properties.name;

          feature.set('textLabel', textLabel);
          let extent: Extent;
          for (let index = 0; index < selectedSite.geometry.coordinates[0].length; index++) {
              const element = selectedSite.geometry.coordinates[0][index];
              selectedSite.geometry.coordinates[0][index] = transform(element, 'EPSG:4326', 'EPSG:3857');
          }
          feature.setGeometry(new Polygon(selectedSite.geometry.coordinates));  

          extent = new Polygon(selectedSite.geometry.coordinates).getExtent();
          
          
          let airpodLayer = mapHelper.getLayerByName('airpodLayer')[0];
          airpodLayer.getSource().clear();
          airpodLayer.getSource().addFeature(feature);
          mapHelper.fit_view(extent!, 14);
      }
    }

  
}