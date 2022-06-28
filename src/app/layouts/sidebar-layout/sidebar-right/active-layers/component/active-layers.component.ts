import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSliderChange } from '@angular/material/slider';
import { faInfoCircle, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { debounceTime, fromEvent, map, Observable, merge as observerMerge } from 'rxjs';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { environment } from 'src/environments/environment';
import { LayersInMap } from '../../../map/interfaces/layerinmap';
import { editLayerZindex } from '../../../map/states/map.actions';
import { MapState } from '../../../map/states/map.reducer';
import { selectAllLayersInToc } from '../../../map/states/map.selector';
import { Map } from '../../../../../core/modules/openlayers';

@Component({
  selector: 'app-active-layers',
  templateUrl: './active-layers.component.html',
  styleUrls: ['./active-layers.component.scss']
})
export class ActiveLayersComponent implements OnInit {
  @Input() map: Map | undefined;
  layersInToc$: Observable<LayersInMap[]>;

  layersInToc: Array<LayersInMap> = [];
  layerChange: Observable<any> = new Observable();

  faInfo = faInfoCircle;
  faShare = faShareAlt;
  faDelete = faTrash;
  environment;

  constructor(private store: Store<MapState>, private thematiqueService: ThematiqueService, private carteService: CarteService) {
    this.layersInToc$ = this.store.select(selectAllLayersInToc);
    this.environment = environment;
  }

  ngOnInit(): void {
    this.map?.getLayers().on('propertychange', ObjectEvent => {
      this.getAllLayersForToc();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.layersInToc$.subscribe(layersInToc => {
      var layer = layersInToc[event.previousIndex];
      this.store.dispatch(editLayerZindex({ layer: layer.layer, zindex: layersInToc[event.currentIndex].zIndex }));
      moveItemInArray(layersInToc, event.previousIndex, event.currentIndex);
    });

    this.getAllLayersForToc();
  }

  getAllLayersForToc() {
    this.layersInToc$.subscribe(layersInToc => {
      let allObservableOFLayers: Array<Observable<any>> = [];
      for (let index = 0; index < layersInToc.length; index++) {
        const layerProp = layersInToc[index];
        if (layerProp['type_layer'] == 'geosmCatalogue') {
          if (layerProp['properties']!['type'] == 'couche') {
            if (this.thematiqueService.getThematiqueFromId(layerProp['properties']!['group_id'])) {
              layerProp.badge = {
                text: this.thematiqueService.getThematiqueFromId(layerProp['properties']!['group_id'])!.nom,
                bgColor: this.thematiqueService.getThematiqueFromId(layerProp['properties']!['group_id'])!.color
              };
            }
            layerProp['data'] = this.thematiqueService.getCoucheFromId(layerProp['properties']!['couche_id']);
          } else if (layerProp['properties']!['type'] == 'carte') {
            if (this.carteService.getGroupeCarteFromId(layerProp['properties']!['group_id'])) {
              layerProp.badge = {
                text: this.carteService.getGroupeCarteFromId(layerProp['properties']!['group_id'])!.nom,
                bgColor: environment.primarycolor
              };
            }
            layerProp['data'] = this.carteService.getCarteById(layerProp['properties']!['couche_id']);
          }
        }
        allObservableOFLayers.push(fromEvent(layerProp.layer, 'change:visible').pipe(map(value => value)));
        allObservableOFLayers.push(fromEvent(layerProp.layer, 'change:zIndex').pipe(map(value => value)));
        allObservableOFLayers.push(fromEvent(layerProp.layer, 'change:opacity').pipe(map(value => value)));
      }

      function compare(a: { zIndex: number }, b: { zIndex: number }) {
        if (a.zIndex < b.zIndex) {
          return 1;
        }
        if (a.zIndex > b.zIndex) {
          return -1;
        }
        return 0;
      }

      this.layersInToc = layersInToc;
      if (allObservableOFLayers.length > 0) {
        this.layerChange = undefined!;
        this.layerChange = observerMerge(...allObservableOFLayers);
        this.layerChange.pipe(debounceTime(1000)).subscribe(response => {
          this.layersInToc.sort(compare);
        });
      }
      this.layersInToc.sort(compare);
    });
  }

  setOpactiyOfLayer(event: MatSliderChange, layer: LayersInMap) {
    layer.layer.setOpacity(event.value! / 100);
  }

  setVisibleOfLayer(event: MatCheckboxChange, layer: LayersInMap) {
    layer.layer.setVisible(event.checked);
  }
}
