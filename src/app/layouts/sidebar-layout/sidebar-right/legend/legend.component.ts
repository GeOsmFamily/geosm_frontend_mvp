import { Map } from 'src/app/core/modules/openlayers';
import { Component, Input, OnInit } from '@angular/core';
import { LayersInMap } from '../../map/interfaces/layerinmap';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllLayersInToc } from '../../map/states/map.selector';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {
  @Input() map: Map | undefined;

  layersInToc$: Observable<LayersInMap[]>;

  layersInTocWithLegend: Array<LayersInMap> = [];

  layer:any
  constructor(
    private store: Store,
    public domSanitizer: DomSanitizer,
    private thematiqueService: ThematiqueService,
    private carteService: CarteService
  ) {
    this.layersInToc$ = this.store.select(selectAllLayersInToc);
  }
  ngOnInit(): void {
    this.map?.getLayers().on('propertychange', _ObjectEvent => {
      this.getAllLayersForToc();
    });
  }

  getAllLayersForToc() {
    this.layersInToc$.subscribe(layersInToc => {
      let reponseLayers: Array<LayersInMap> = [];
      for (let index = 0; index < layersInToc.length; index++) {
        const layerProp = layersInToc[index];
        if (layerProp.legendCapabilities && layerProp['type_layer'] == 'geosmCatalogue') {
          if (layerProp.legendCapabilities.useCartoServer) {
            let url;
            let identifiant;
            if (layerProp['properties']!['type'] == 'couche') {
              let couche = this.thematiqueService.getCoucheFromId(layerProp['properties']!['couche_id']);
              url = couche ? couche.qgis_url : undefined;
              identifiant = couche ? couche.identifiant : undefined;
              this.layer=couche
            } else if (layerProp['properties']!['type'] == 'carte') {
              let carte = this.carteService.getCarteById(layerProp['properties']!['couche_id']);
              url = carte ? carte.url : undefined;
              identifiant = carte! ? carte.identifiant : undefined;
            }
            if (url && identifiant) {

let legendUrl:any
if(this.layer.nom === "Inondation_10ans"){

  legendUrl="https://wxs-preprod.sogefi.io/?map=/nas/qgis/int/hauteur_q10.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=Hauteurs_Q10_2022&FORMAT=image/png;%20mode=8bit"
}
else{

  legendUrl =
  url +
  '&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=' +
  identifiant +
  '&STYLE=default&SLD_VERSION=1.1.0&LAYERTITLE=false&RULELABEL=true';

}
                           layerProp.legendCapabilities.urlImg = legendUrl.trim();
            }
          }

          if (layerProp.legendCapabilities.urlImg) {
            reponseLayers.push(layerProp);
          }
        }
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
      this.layersInTocWithLegend = reponseLayers;

      this.layersInTocWithLegend.sort(compare);
    });
  }
}
