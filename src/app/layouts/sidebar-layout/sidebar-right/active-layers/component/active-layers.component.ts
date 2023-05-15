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
import { Map } from '../../../../../core/modules/openlayers';
import { MapHelper } from '../../../map/helpers/maphelper';
import { ShareService } from 'src/app/core/services/geosm/share.service';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { Carte } from 'src/app/core/interfaces/carte-interface';
import { Couche, Metadatas } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';
import { MatDialog } from '@angular/material/dialog';
import { MetadataModalComponent } from './metadata-modal/metadata-modal.component';

@Component({
  selector: 'app-active-layers',
  templateUrl: './active-layers.component.html',
  styleUrls: ['./active-layers.component.scss']
})
export class ActiveLayersComponent implements OnInit {
  @Input() map: Map | undefined;

  layersInToc: Array<LayersInMap> = [];
  layerChange: Observable<any> = new Observable();

  faInfo = faInfoCircle;
  faShare = faShareAlt;
  faDelete = faTrash;
  environment;

  constructor(
    private shareService: ShareService,
    private thematiqueService: ThematiqueService,
    private carteService: CarteService,
    private componentHelper: ComponentHelper,
    public dialog: MatDialog
  ) {
    this.environment = environment;
  }

  ngOnInit(): void {
    this.map?.getLayers().on('propertychange', _ObjectEvent => {
      this.getAllLayersForToc();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.layersInToc[event.previousIndex].zIndex != 1) {
    
    let layer = this.layersInToc[event.previousIndex];
    let mapHelper = new MapHelper();
    mapHelper.editZindexOfLayer(layer.layer, this.layersInToc[event.currentIndex].zIndex);
    moveItemInArray(this.layersInToc, event.previousIndex, event.currentIndex);
    this.getAllLayersForToc();
    }
  }

  getAllLayersForToc() {
    let mapHelper = new MapHelper();

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    let allObservableOFLayers: Array<Observable<any>> = [];
    for (let index = 0; index < reponseLayers.length; index++) {
      const layerProp = reponseLayers[index];
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

    this.layersInToc = reponseLayers;
    if (allObservableOFLayers.length > 0) {
      this.layerChange = undefined!;
      this.layerChange = observerMerge(...allObservableOFLayers);
      this.layerChange.pipe(debounceTime(1000)).subscribe(_response => {
        this.layersInToc.sort(compare);
      });
    }
    this.layersInToc.sort(compare);
  }

  setOpactiyOfLayer(event: MatSliderChange, layer: LayersInMap) {
    layer.layer.setOpacity(event.value! / 100);
  }

  setVisibleOfLayer(event: MatCheckboxChange, layer: LayersInMap) {
    layer.layer.setVisible(event.checked);
  }

  shareAllLayersInToc() {
    let pteToGetParams = Array();
    for (let index = 0; index < this.layersInToc.length; index++) {
      const layer = this.layersInToc[index];
      if (layer.activeLayers.share) {
        pteToGetParams.push({
          typeLayer: layer.properties!['type'],
          id_layer: layer.properties!['couche_id'],
          group_id: layer.properties!['group_id']
        });
      }
    }
    let params = this.shareService.shareLayers(pteToGetParams);
    let url_share = environment.url_frontend + '?' + params;
    this.componentHelper.openSocialShare(url_share, 7);
  }

  clearMap() {
    let mapHelper = new MapHelper();

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    for (let index = 0; index < reponseLayers.length; index++) {
      const layer = reponseLayers[index];
      if (layer['properties']!['type'] == 'carte') {
        let carte = this.carteService.getCarteFromIdAndGroupeCarteId(layer['properties']!['couche_id'], layer['properties']!['group_id']);
        if (!carte!.principal) {
          this.removeLayer(layer);
        }
      } else if (layer.nom == 'Mapillary') {
        this.removeLayer(layer);
      } else {
        this.removeLayer(layer);
      }
    }
  }

  removeLayer(layer: LayersInMap) {
    if (layer.type_layer == 'geosmCatalogue') {
      this.removeLayerCatalogue(layer);
    } else {
      let mapHelper = new MapHelper();
      mapHelper.removeLayerToMap(layer.layer);
    }
  }

  removeLayerCatalogue(layer: LayersInMap) {
    let mapHelper = new MapHelper();
    if (layer['properties']!['type'] == 'carte') {
      let carte: Carte = this.carteService.getCarteFromIdAndGroupeCarteId(layer.properties!['couche_id'], layer.properties!['group_id'])!;
      if (carte) {
        carte.check = false;
      }
    } else if (layer['properties']!['type'] == 'couche') {
      let couche: Couche = this.thematiqueService.getCoucheFromId(layer.properties!['couche_id'])!;
      if (couche) {
        couche.check = false;
      }
    }

    mapHelper.removeLayerToMap(layer.layer);
  }

  shareLayer(layer: LayersInMap) {
    let params = this.shareService.shareLayer(layer.properties!['type'], layer.properties!['couche_id'], layer.properties!['group_id']);
    let url_share = environment.url_frontend + '?' + params;
    this.componentHelper.openSocialShare(url_share, 7);
  }

  openMetadata(layer: LayersInMap) {
    let metadata: Metadatas;
    let wms_type;
    let carte: Carte;
    let couche: Couche;
    if (layer['properties']!['type'] == 'carte') {
      carte = this.carteService.getCarteFromIdAndGroupeCarteId(layer.properties!['couche_id'], layer.properties!['group_id'])!;
      metadata = carte!.metadatas;
    } else if (layer['properties']!['type'] == 'couche') {
      couche = this.thematiqueService.getCoucheFromIdCoucheAndThematiqueId(layer.properties!['couche_id'], layer.properties!['group_id'])!;
      metadata = couche!.metadatas;
      wms_type = couche!.wms_type;
    }

    if (this.displayMetadataLink(metadata!) || wms_type == 'osm') {
      const MetaData = this.dialog.open(MetadataModalComponent, {
        minWidth: '350px',
        data: {
          exist: true,
          metadata: metadata!,
          layer: couche!,
          nom: carte! ? carte.nom : couche!.nom,
          url_prefix: environment.url_services,
          data: carte! ? carte : couche!
        }
      });

      MetaData.afterClosed().subscribe(result => {
        // Result
      });
    } else {
      this.dialog.open(MetadataModalComponent, {
        minWidth: '350px',
        data: {
          exist: false,
          metadata: metadata!,
          layer: couche!,
          nom: carte! ? carte.nom : couche!.nom,
          url_prefix: environment.url_services,
          data: carte! ? carte : couche!
        }
      });
    }
  }

  displayMetadataLink(metadata: Metadatas) {
    if (Array.isArray(metadata)) {
      return false;
    } else {
      return true;
    }
  }
}
