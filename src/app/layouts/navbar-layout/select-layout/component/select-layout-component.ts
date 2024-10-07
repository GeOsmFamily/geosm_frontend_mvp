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
    selectedAirpod=-1;
    isLoading$!: Observable<boolean>;
    flyEffect= false;
    places:any[]=[
        {
            name:'Douala',
            id:0
        },
        {
            name:'Batouri',
            id:1
        }
    ];
    map!: Map;
    batouriLayer: BaseLayer = new VectorLayer({
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
          width: 4
        }),
        text: new Text(textStyle)
      });
    },
    //@ts-ignore
    type_layer: 'batouriLayer',
    nom: 'batouriLayer'
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
        if (mapHelper.getLayerByName('batouriLayer').length > 0) {
          this.batouriLayer = mapHelper.getLayerByName('batouriLayer')[0];
          this.batouriLayer.setZIndex(2000);
        } else {
          this.batouriLayer.setZIndex(2000);
          mapHelper.map?.addLayer(this.batouriLayer);
        }
        if (mapHelper.getLayerByName('batouriLayer').length > 0) {
          mapHelper.getLayerByName('batouriLayer')[0].getSource().clear();
        }
      }

    async setPlace(event: any){
      let mapHelper = new MapHelper();
      const reponseData  = await fetch('../../../../../assets/layer_data/Douala_batouri.geojson');
      const batouriData = await reponseData.json();

      if( (mapHelper.getLayerByName('batouriLayer').length = 0) || (this.selectedAirpod===-1)){
        this.flyEffect=false;
      }else{
        this.flyEffect=true;
      }
      this.selectedAirpod=0;  
      this.selectedAirpod=event.target.value;
      let selectedSite = batouriData.features[event.target.value];
      mapHelper.clearLayerOnMap('batouriLayer');
      this.selectPlaceEvent.emit();
      setTimeout(() => {
        this.selectAirPod(selectedSite);
      }, 500);
    }

    selectAirPod(selectedSite: any){
      let mapHelper = new MapHelper();
      if (mapHelper.getLayerByName('batouriLayer').length > 0) {

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
          
          
          let batouriLayer = mapHelper.getLayerByName('batouriLayer')[0];
          batouriLayer.getSource().clear();
          batouriLayer.getSource().addFeature(feature);
          mapHelper.fit_view(extent!, 14,this.flyEffect);                               
      }
    }

  
}