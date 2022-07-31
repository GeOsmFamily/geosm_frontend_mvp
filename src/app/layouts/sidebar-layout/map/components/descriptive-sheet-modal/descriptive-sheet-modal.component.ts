import { CarteService } from './../../../../../core/services/geosm/carte/carte.service';
import { CircleStyle, Feature, Fill, Stroke, Style, VectorLayer, VectorSource } from 'src/app/core/modules/openlayers';
import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DescriptiveSheet } from '../../interfaces/descriptiveSheet';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { ShareService } from 'src/app/core/services/geosm/share.service';
import { environment } from 'src/environments/environment';
import { MapHelper } from '../../helpers/maphelper';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { faArrowsAlt, faSearchPlus, faShareAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-descriptive-sheet-modal',
  templateUrl: './descriptive-sheet-modal.component.html',
  styleUrls: ['./descriptive-sheet-modal.component.scss']
})
export class DescriptiveSheetModalComponent implements OnInit {
  imgSrc: string | undefined;
  faShare = faShareAlt;
  faSearch = faSearchPlus;
  faTimesCircle = faTimesCircle;
  faArrowAlt = faArrowsAlt;

  highlightLayer = new VectorLayer({
    source: new VectorSource(),
    style: _feature => {
      let color = '#f44336';
      return new Style({
        fill: new Fill({
          color: [DataHelper.hexToRgb(color)!.r, DataHelper.hexToRgb(color)!.g, DataHelper.hexToRgb(color)!.b, 0.5]
        }),
        stroke: new Stroke({
          color: color,
          width: 6
        }),
        image: new CircleStyle({
          radius: 11,
          stroke: new Stroke({
            color: color,
            width: 4
          }),
          fill: new Fill({
            color: [DataHelper.hexToRgb(color)!.r, DataHelper.hexToRgb(color)!.g, DataHelper.hexToRgb(color)!.b, 0.5]
          })
        })
      });
    },
    //@ts-ignore
    type_layer: 'highlightFeature',
    nom: 'highlightFeature'
  });

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public descriptiveModel: DescriptiveSheet,
    public dialogRef: MatDialogRef<DescriptiveSheetModalComponent>,
    public thematiqueService: ThematiqueService,
    public carteService: CarteService,
    public shareService: ShareService,
    public componentHelper: ComponentHelper
  ) {}

  ngOnInit(): void {
    this.initialiseHightLightMap();

    if (this.descriptiveModel?.layer?.properties!['type'] == 'couche') {
      this.imgSrc =
        environment.url_services + this.thematiqueService.getCoucheFromId(this.descriptiveModel.layer.properties['couche_id'])!.logo;
    } else if (this.descriptiveModel?.layer?.properties!['type'] == 'carte') {
      this.imgSrc =
        environment.url_services + this.carteService.getCarteById(this.descriptiveModel.layer.properties['couche_id'])!.image_url;
    }

    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }

  loadGeometryInHightLightLayer() {
    if (this.descriptiveModel.geometry) {
      let feature = new Feature();
      feature.setGeometry(this.descriptiveModel.geometry);

      this.highlightLayer.getSource()!.addFeature(feature);
    }
  }

  initialiseHightLightMap() {
    let mapHelper = new MapHelper();
    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      this.highlightLayer = mapHelper.getLayerByName('highlightFeature')[0];
      this.highlightLayer.setZIndex(1000);
    } else {
      this.highlightLayer.setZIndex(1000);
      mapHelper.map?.addLayer(this.highlightLayer);
    }

    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      mapHelper.getLayerByName('highlightFeature')[0].getSource().clear();
    }
  }

  closeModal(): void {
    let mapHelper = new MapHelper();

    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      mapHelper.getLayerByName('highlightFeature')[0].getSource().clear();
    }

    this.dialogRef.close();
  }

  shareFeature() {
    let url = this.descriptiveModel.getShareUrl!(environment, this.shareService)!;
    this.componentHelper.openSocialShare(url);
  }

  zoomOnFeatureExtent() {
    if (this.descriptiveModel.geometry) {
      let extent = this.descriptiveModel.geometry.getExtent();
      let mapHelper = new MapHelper();
      mapHelper.fit_view(extent, 16);
    }
  }

  setSescriptiveModel(data: DescriptiveSheet) {
    this.descriptiveModel = data;
    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }
}
