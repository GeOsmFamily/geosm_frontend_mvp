import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { TranslateService } from '@ngx-translate/core';
import { Draw, Feature, Map, unByKey, VectorSource, GeoJSON } from 'src/app/core/modules/openlayers';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LayersTools } from '../../tools/layers';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { DrawToolInterace, ModifyToolInterface, ModifyToolTypeInterface, PropertiesFeatureInterface } from '../../interfaces/drawTool';
import { DrawEvent } from 'ol/interaction/Draw';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import { environment } from 'src/environments/environment';
import { SelectEvent } from 'ol/interaction/Select';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as jQuery from 'jquery';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Draw as DrawModel, DrawInterface } from '../../interfaces/draw';
import { DrawService } from '../../services/draw.service';

type NewType = 'Point' | 'LineString' | 'Polygon';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit {
  faTimes = faTimes;

  @Input() map: Map | undefined;

  source: VectorSource = new VectorSource();

  formulaireText: FormGroup | undefined;

  draw: Draw | undefined;

  /**
   * Differents type of draw
   */
  drawTools: {
    Point: DrawToolInterace;
    LineString: DrawToolInterace;
    Polygon: DrawToolInterace;
    Text: DrawToolInterace;
    key: Array<any>;
  } = {
    Point: {} as DrawToolInterace,
    LineString: {} as DrawToolInterace,
    Polygon: {} as DrawToolInterace,
    Text: {} as DrawToolInterace,
    key: []
  };

  modifyTool: ModifyToolInterface = {
    active: false,
    geometry: { active: false },
    comment: { active: false },
    color: { active: false },
    delete: { active: false },
    interactions: [],
    key: []
  };

  overlay;
  overlayColor;
  vector;
  select;
  modify;

  constructor(
    private _ngZone: NgZone,
    private fb: FormBuilder,
    public translate: TranslateService,
    private _snackBar: MatSnackBar,
    public drawService: DrawService,
    public componentHelper: ComponentHelper
  ) {
    let layersTools = new LayersTools();
    this.overlay = layersTools.createOverlay('overlay-draw-text');
    this.overlayColor = layersTools.createOverlay('overlay-draw-color');
    this.vector = layersTools.createVectorLayer(this.source, 'draw', 'draw');
    this.select = layersTools.createSelect(this.vector);
    this.modify = layersTools.createModify(this.source);
  }

  ngOnInit(): void {
    let mapHelper = new MapHelper();
    this.map?.addOverlay(this.overlay);
    this.map?.addOverlay(this.overlayColor);
    this.vector.set('inToc', false);
    mapHelper.addLayerToMap(this.vector);
  }

  toogleAddDraw(type: NewType) {
    this.desactivateAllModificationTool();
    if (this.drawTools[type].active) {
      this.desactivateAllAddTool();
      this.drawTools[type].active = false;
    } else {
      if (this.draw) {
        this.desactivateAllAddTool();
      }
      this.addInteractions(type);
      this.drawTools[type].active = true;
    }
  }

  desactivateAllModificationTool() {
    this.modifyTool.geometry.active = false;
    this.modifyTool.comment.active = false;
    this.modifyTool.color.active = false;
    this.modifyTool.delete.active = false;
    jQuery('#overlay-draw-color').hide();
    this.removeAllModifiactionInteraction();
  }

  removeAllModifiactionInteraction() {
    for (let index = 0; index < this.modifyTool.interactions.length; index++) {
      this.map?.removeInteraction(this.modifyTool.interactions[index]);
    }

    for (let index = 0; index < this.modifyTool.key.length; index++) {
      unByKey(this.modifyTool.key[index]);
    }

    this.modifyTool.interactions = [];
    this.modifyTool.key = [];
  }

  desactivateAllAddTool() {
    for (const key in this.drawTools) {
      if (this.drawTools.hasOwnProperty(key) && key != 'key') {
        // @ts-ignore
        const element = this.drawTools[key];
        element.active = false;
      }
    }
    this.removeAddInteraction();
  }

  removeAddInteraction() {
    this.map?.removeInteraction(this.draw!);
    for (let index = 0; index < this.drawTools.key.length; index++) {
      const element = this.drawTools.key[index];
      unByKey(element);
    }
    this.draw = undefined;
  }

  addInteractions(type: 'Point' | 'LineString' | 'Polygon') {
    this.draw = new Draw({
      source: this.source,
      type: type
    });
    this.map?.addInteraction(this.draw);

    let keyEventStart = this.draw.on('drawstart', (_drawEvent: any) => {
      this._ngZone.run(() => {
        this.hideOverlay();
        this.vector.setZIndex(1000);
      });
    });

    let keyEventEnd = this.draw.on('drawend', (drawEvent: DrawEvent) => {
      this._ngZone.run(() => {
        let drawFeature: Feature = drawEvent.feature;
        drawFeature.set('type', type);
        let featureId = DataHelper.makeid(5);
        let allFeatureIds = MapHelper.listIdFromSource(this.source);

        while (allFeatureIds.indexOf(featureId) != -1) {
          featureId = DataHelper.makeid(5);
        }

        drawFeature.setId(featureId);
        //@ts-ignore
        let positionOfOverlay = drawFeature
          .getGeometry()
          //@ts-ignore
          ?.getLastCoordinate();

        this.constructFormText({
          comment: '',
          color: environment.primarycolor,
          featureId: featureId
        });

        this.showOverlay(positionOfOverlay);
      });
    });

    this.drawTools.key.push(keyEventStart);
    this.drawTools.key.push(keyEventEnd);
  }

  hideOverlay() {
    jQuery('#overlay-draw-text').hide();
  }

  showOverlay(coordinates: Array<number>) {
    if (!this.overlay.getElement()) {
      this.overlay.setElement(document.getElementById('overlay-draw-text')!);
    }
    this.overlay.setPosition(coordinates);
    jQuery('#overlay-draw-text').show();
  }

  constructFormText(properties: PropertiesFeatureInterface) {
    if (!this.formulaireText) {
      this.formulaireText = this.fb.group({});
    }

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        // @ts-ignore
        const element = properties[key];
        if (this.formulaireText.controls[key]) {
          this.formulaireText.controls[key].setValue(element);
        } else {
          this.formulaireText.addControl(key, new FormControl(element));
        }
      }
    }
  }

  getDrawTool(type: 'Point' | 'LineString' | 'Polygon'): DrawToolInterace {
    return this.drawTools[type];
  }

  modifyDraw(type: 'geometry' | 'comment' | 'color' | 'delete') {
    if (type == 'comment') {
      this.toogleModifyDrawComment();
    } else if (type == 'geometry') {
      this.toogleModifyDrawGeometry();
    } else if (type == 'delete') {
      this.toogleModifyDeleteFeature();
    } else if (type == 'color') {
      this.toogleModifyDrawColor();
    }
  }

  toogleModifyDrawComment() {
    if (this.modifyTool.comment.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.comment.active = true;

      this.map?.addInteraction(this.select);

      let keyEventSelect = this.select.on('select', (selectEvent: SelectEvent) => {
        let selectFeatures: Array<Feature> = selectEvent.selected;

        if (selectFeatures.length > 0) {
          let feature = selectFeatures[0];

          //@ts-ignore
          let positionOfOverlay = feature.getGeometry()?.getLastCoordinate();

          this.constructFormText({
            comment: feature.get('comment') ? feature.get('comment') : '',
            color: feature.get('color') ? feature.get('color') : undefined,
            featureId: feature.getId()?.toString()!
          });

          this.showOverlay(positionOfOverlay);
        }

        let features = this.select.getFeatures();
        features.clear();
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  toogleModifyDrawGeometry() {
    if (this.modifyTool.geometry.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.geometry.active = true;

      this.map?.addInteraction(this.modify);
      this.modifyTool.interactions.push(this.modify);
    }
  }

  toogleModifyDeleteFeature() {
    if (this.modifyTool.delete.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.delete.active = true;

      this.map?.addInteraction(this.select);

      let keyEventSelect = this.select.on('select', (selectEvent: SelectEvent) => {
        let selectFeatures: Array<Feature> = selectEvent.selected;
        if (selectFeatures.length > 0) {
          let feature = selectFeatures[0];
          this.source.removeFeature(feature);
        }
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  toogleModifyDrawColor() {
    if (this.modifyTool.color.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.color.active = true;

      this.map?.addInteraction(this.select);

      let keyEventSelect = this.select.on('select', (selectEvent: SelectEvent) => {
        let selectFeatures: Array<Feature> = selectEvent.selected;
        if (selectFeatures.length > 0) {
          let feature = selectFeatures[0];
          //@ts-ignore
          let positionOfOverlay = feature.getGeometry()?.getLastCoordinate();
          if (!this.overlayColor.getElement()) {
            this.overlayColor.setElement(document.getElementById('overlay-draw-color')!);
          }

          this.constructFormText({
            comment: feature.get('comment') ? feature.get('comment') : '',
            color: feature.get('color') ? feature.get('color') : undefined,
            featureId: feature.getId()?.toString()!
          });

          this.overlayColor.setPosition(positionOfOverlay);
          jQuery('#overlay-draw-color').show();

          let features = this.select.getFeatures();
          features.clear();
        }
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  getModifyTool(type: 'geometry' | 'comment' | 'color' | 'delete'): ModifyToolTypeInterface {
    return this.modifyTool[type];
  }

  toogleModifyDraw() {
    if (this.source.getFeatures().length > 0) {
      if (this.modifyTool.active) {
        this.modifyTool.active = false;
        this.desactivateAllModificationTool();
      } else {
        this.desactivateAllAddTool();
        this.modifyTool.active = true;
      }
    } else {
      this.modifyTool.active = false;
      this.desactivateAllModificationTool();

      this.translate.get('tools').subscribe((res: any) => {
        this._snackBar.open(res.no_draw, res.cancel, {
          duration: 5000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center'
        });
      });
    }
  }

  shareAllDraw() {
    if (this.source.getFeatures().length > 0) {
      let dataToSendInDB: Array<DrawModel> = [];
      const code = DataHelper.makeid(8);
      for (let index = 0; index < this.source.getFeatures().length; index++) {
        const feature = this.source.getFeatures()[index];
        dataToSendInDB.push({
          code: code,
          type: feature.getGeometry()!.getType(),
          description: feature.get('comment') ? feature.get('comment') : '',
          color: feature.get('color') ? feature.get('color') : environment.primarycolor,
          geom: JSON.stringify(new GeoJSON().writeGeometryObject(feature.getGeometry()!)),
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      this.drawService.saveDraw(dataToSendInDB).subscribe((drawInterface: DrawInterface) => {
        if (drawInterface.success) {
          let url_share = environment.url_frontend + '?share=draw&id=' + code;
          this.componentHelper.openSocialShare(url_share, 7);
        } else {
          this.translate.get('server_error').subscribe((res: any) => {
            this._snackBar.open(res.message, res.cancel, {
              duration: 5000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center'
            });
          });
        }
      });
    }
  }

  deleteleAllDraw() {
    this.source.clear();
    let mapHelper = new MapHelper();
    let drawLayers = mapHelper.getLayerByName('draw');

    for (let index = 0; index < drawLayers.length; index++) {
      mapHelper.removeLayerToMap(drawLayers[index]);
    }
  }

  saveFormToFeaturePte() {
    if (this.formulaireText?.controls['featureId']) {
      console.log(this.formulaireText?.getRawValue());
      let feature = this.source.getFeatureById(this.formulaireText.controls['featureId'].value);
      for (const key in this.formulaireText.getRawValue()) {
        if (this.formulaireText.getRawValue().hasOwnProperty(key)) {
          const element = this.formulaireText.getRawValue()[key];
          feature!.set(key, element);
        }
      }
    }
    this.hideOverlay();
    this.hideOverlayColor();
  }

  hideOverlayColor() {
    jQuery('#overlay-draw-color').hide();
  }

  colorChanged(new_color: string) {
    this.formulaireText?.controls['color'].setValue(new_color);
  }
}
