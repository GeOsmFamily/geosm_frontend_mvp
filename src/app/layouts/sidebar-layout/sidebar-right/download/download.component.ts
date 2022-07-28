import { Feature, Fill, GeoJSON, getCenter, Overlay, Stroke, Style, VectorLayer, VectorSource } from 'src/app/core/modules/openlayers';
import { selectProject } from './../../map/states/map.selector';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { debounceTime, filter, from, map, Observable, startWith, tap } from 'rxjs';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectLayersForDownload } from './tools/download-select-layers';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { DownloadDataModelInterface, ResponseOfSerachLimitInterface, SearchLayerToDownloadModelInterface } from './interfaces/download';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/core/services/api/api.service';
import { LimitesInterface } from './interfaces/limite';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MapHelper } from '../../map/helpers/maphelper';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import OverlayPositioning from 'ol/OverlayPositioning';
import { MatDialog } from '@angular/material/dialog';
import { ListDownloadLayersComponent } from './components/list-download-layers/list-download-layers.component';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { ChartOverlayComponent } from './components/chart-overlay/chart-overlay.component';
import { DownloadService } from './service/download.service';
import { QgisInterface } from './interfaces/qgis';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent extends SelectLayersForDownload implements OnInit {
  @ViewChild('downlod_list_overlays') downlodListOverlays: ElementRef | undefined;
  lastSaturday = moment().subtract(1, 'weeks').isoWeekday(6).locale('fr');

  userClosedOverlay: EventEmitter<any> = new EventEmitter<any>();

  userListFilesToDownload: EventEmitter<any> = new EventEmitter<any>();

  project$: Observable<ProjectInterface>;

  project: ProjectInterface | undefined;

  listOfChartsInMap: {
    [key: string]: {
      index: number;
      nom: string;
      number: number;
      id: number;
      url_gpkg: string;
    }[];
  } = {};

  formsEmprise: FormGroup | undefined;

  filterEmpriseOptions: ResponseOfSerachLimitInterface[] = [];

  constructor(
    private store: Store,
    public fb: FormBuilder,
    public thematiqueService: ThematiqueService,
    public downloadService: DownloadService,
    public apiService: ApiService,
    public dialog: MatDialog,
    public componentHelper: ComponentHelper
  ) {
    super(fb, thematiqueService);
    this.project$ = this.store.select(selectProject);
  }
  ngOnInit(): void {
    this.project$.subscribe(project => {
      try {
        this.project = project;
        this.layersDownlodable = this.getAllLayersDownlodable();
        this.initialiseFormsLayers();
        this.initialiseFormsEmprise();
        this.setRoiTypeToAll();

        this.userClosedOverlay.subscribe(idOverlay => {
          this.closeChart(idOverlay);
        });

        this.userListFilesToDownload.subscribe(idOverlay => {
          this.openModalListDonwnloadLayers(idOverlay);
        });

        this.downloadModel.roiType = 'emprise';
      } catch (error) {}
    });
  }

  getAllLayersDownlodable(): Array<SearchLayerToDownloadModelInterface> {
    let response: SearchLayerToDownloadModelInterface[] = [];

    for (let iThematique = 0; iThematique < this.thematiqueService.getAllThematiques().length; iThematique++) {
      const groupThematique = this.thematiqueService.getAllThematiques()[iThematique];

      for (let index = 0; index < groupThematique.sous_thematiques.length; index++) {
        const sous_thematique = groupThematique.sous_thematiques[index];
        for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
          const couche = sous_thematique.couches[jndex];
          response.push({
            name: couche.nom,
            description: groupThematique.nom + ' / ' + sous_thematique.nom,
            id: couche.id,
            source: 'geosmCatalogue'
          });
        }
      }
    }

    return response;
  }

  initialiseFormsEmprise() {
    let empriseControl = new FormControl('', [Validators.minLength(2)]);

    empriseControl.valueChanges
      .pipe(
        debounceTime(300),
        filter(value => typeof value == 'string' && value.length > 1),
        startWith(''),
        tap(() => {
          console.log('loading');
        }),
        map(value => {
          return from(
            this.apiService.getRequestFromOtherHost(
              'https://nominatim.openstreetmap.org/search?q=' +
                value.toString() +
                '&format=geojson&&polygon_geojson=1&addressdetails=1&countrycodes=' +
                environment.country_code
            )
          );
        })
      )
      .subscribe((value: Observable<LimitesInterface>) => {
        value.subscribe(data => {
          let response: Array<ResponseOfSerachLimitInterface> = [];
          for (let i = 0; i < data.features.length; i++) {
            if (data.features[i].properties.type == 'administrative') {
              response.push({
                name: data.features[i].properties.display_name,
                id: data.features[i].properties.osm_id,
                geometry: data.features[i],
                bbox: data.features[i].bbox,
                limitName: data.features[i].properties.display_name,
                ref: data.features[i].properties.type
              });
            }
          }

          this.filterEmpriseOptions = response;
        });
      });

    this.formsEmprise = this.fb.group({
      emprise: empriseControl
    });
  }

  toogleRoiType(value: MatSlideToggleChange) {
    if (value.checked) {
      this.setRoiTypeToAll();
    } else {
      this.downloadModel.roiType = 'emprise';
      this.downloadModel.roiGeometry = undefined;
    }
  }

  setRoiTypeToAll() {
    this.downloadModel.roiType = 'all';
    let feature = new GeoJSON().readFeature(this.project?.config.roiGeojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    this.downloadModel.roiGeometry = feature.getGeometry();
    if (this.formsEmprise) {
      this.formsEmprise.reset('');
    }
  }

  closeChart(idOverlay: string) {
    let mapHelper = new MapHelper();

    this.removeLayerExportData();

    let overlay = mapHelper.map?.getOverlayById(idOverlay);
    mapHelper.map?.removeOverlay(overlay!);
  }

  removeLayerExportData() {
    let mapHelper = new MapHelper();
    let layer = mapHelper.getLayerByName('exportData');
    for (let index = 0; index < layer.length; index++) {
      const element = layer[index];
      mapHelper.map?.removeLayer(element);
    }
  }

  openModalListDonwnloadLayers(idOverlay: string) {
    let modelDownload: DownloadDataModelInterface[] = [];
    for (let index = 0; index < this.listOfChartsInMap[idOverlay].length; index++) {
      const element = this.listOfChartsInMap[idOverlay][index];
      modelDownload.push({
        layer: undefined!,
        groupThematique: undefined!,
        empriseName: this.downloadModel.roiType == 'emprise' ? 'Emprise' : 'Export total',
        nom: element.nom,
        number: element.number,
        index: element.index,
        id: element.id,
        url_gpkg: element.url_gpkg
      });
    }

    this.openModalDownloadData(modelDownload);
  }

  openModalDownloadData(data: DownloadDataModelInterface[]) {
    let proprietes = {
      disableClose: false,
      minWidth: 400,
      data: data
    };

    const modal = this.dialog.open(ListDownloadLayersComponent, proprietes);

    modal.afterClosed().subscribe(async (result: any) => {
      console.log(result);
    });
  }

  getGeometryOfEmprise(response: ResponseOfSerachLimitInterface) {
    console.log(response);
    let geo = {
      type: 'FeatureCollection',
      name: 'emprise',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } },
      features: [
        {
          type: 'Feature',
          geometry: response.geometry.geometry,
          properties: response.geometry.properties,
          bbox: response.geometry.bbox
        }
      ]
    };
    console.log(geo);
    let feature = new GeoJSON().readFeatures(geo, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    this.downloadModel.roiGeometry = feature[0].getGeometry();
    this.downloadModel.roiBbox = response.geometry.bbox;
    console.log(this.downloadModel.roiGeometry);
  }

  displayAutocompleEmpriseFn(emprise: ResponseOfSerachLimitInterface): string {
    if (emprise) {
      if (emprise.ref) {
        return emprise.name + '(' + emprise.ref + ')';
      } else {
        return emprise.name;
      }
    } else {
      return '';
    }
  }

  empriseSelected(option: MatAutocompleteSelectedEvent) {
    let empriseInForm: ResponseOfSerachLimitInterface = option.option.value;
    this.getGeometryOfEmprise(empriseInForm);
  }

  generateExport() {
    if (this.downloadModel.roiType == 'emprise') {
      let layers: Array<{
        index: number;
        nom: string;
        number: number;
        id: number;
        url_gpkg: any;
      }> = [];

      for (let index = 0; index < this.downloadModel.layers.length; index++) {
        const layer = this.downloadModel.layers[index];
        console.log(this.downloadModel.roiBbox);
        let latMax = this.downloadModel.roiBbox[3];
        let latMin = this.downloadModel.roiBbox[1];
        let lonMax = this.downloadModel.roiBbox[2];
        let lonMin = this.downloadModel.roiBbox[0];

        let bboxString = `${lonMin},${latMin},${lonMax},${latMax}`;

        let idThematiqueByLayer = this.thematiqueService.getThematiqueFromIdCouche(layer.id)?.id;

        let pathQgis = this.project?.config.data.instance.nom + '/' + this.project?.config.data.instance.nom + idThematiqueByLayer;

        this.downloadService.searchDataInLimit(pathQgis, layer.identifiant, bboxString).subscribe((response: QgisInterface) => {
          console.log(response.features.length);
          //  let uri = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(response.toString()));
          layers.push({
            index: index,
            nom: layer.nom,
            number: response.features.length,
            id: layer.id,
            url_gpkg: ''
          });
        });
      }
      setTimeout(() => {
        this.displayResultExport(layers, this.downloadModel.roiGeometry, 'Emprise');
      }, 1000);
    } else {
      let layers: Array<{
        index: number;
        nom: string;
        number: number;
        id: number;
        url_gpkg: string;
      }> = [];

      for (let index = 0; index < this.downloadModel.layers.length; index++) {
        const layer = this.downloadModel.layers[index];

        let url_gpkg =
          environment.url_qgis +
          '/var/www/html/src/qgis/' +
          this.project?.config.data.instance.nom +
          '/gpkg/' +
          layer.nom +
          layer.id +
          '.gpkg';

        layers.push({
          index: index,
          nom: layer.nom,
          number: layer.number_features,
          id: layer.id,
          url_gpkg: url_gpkg
        });
      }

      this.displayResultExport(layers, this.downloadModel.roiGeometry, 'Export total');
    }
  }

  displayResultExport(
    listData: Array<{
      index: number;
      id: number;
      nom: string;
      number: number;
      url_gpkg: string;
    }>,
    geometry: any,
    title: string
  ) {
    this.closeAllChartsInMap();

    let idOverlay = DataHelper.makeid();

    let layerExport = this.constructLayerToDisplayResult();
    layerExport.set('properties', { idOverlay: idOverlay });
    let featureRoi = new Feature();
    featureRoi.setGeometry(geometry);
    layerExport.getSource()!.addFeature(featureRoi);

    let mapHelper = new MapHelper();
    mapHelper.addLayerToMap(layerExport);

    mapHelper.map?.getView().fit(layerExport.getSource()!.getExtent(), {
      size: mapHelper.map.getSize(),
      duration: 1000
    });

    let centerOfRoi = getCenter(layerExport.getSource()!.getExtent());

    let numbers = Array();
    let labels = Array();
    for (let index = 0; index < listData.length; index++) {
      numbers.push(listData[index]['number']);
      labels.push(listData[index]['nom'] + ' (' + listData[index]['number'] + ') ');
    }
    let dynamicColors = function () {
      let r = Math.floor(Math.random() * 255);
      let g = Math.floor(Math.random() * 255);
      let b = Math.floor(Math.random() * 255);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    };
    let coloR = Array();
    for (let _i in numbers) {
      coloR.push(dynamicColors());
    }

    let chartConfig = {
      type: 'pie',
      scaleFontColor: 'red',
      data: {
        labels: labels,
        datasets: [
          {
            data: numbers,
            backgroundColor: coloR,
            borderColor: 'rgba(200, 200, 200, 0.75)',
            hoverBorderColor: 'rgba(200, 200, 200, 1)'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#fff',
            fontSize: 16,
            position: 'top'
          },

          legend: {
            display: true,
            labels: {
              fontColor: '#fff',
              fontSize: 14
            }
          }
        },

        scales: {
          y: {
            display: false
          },
          x: {
            display: false
          }
        },

        onClick: (_event: { target: { id: any } }) => {
          // console.log(_event.target.id);
        }
      }
    };

    let elementChart = this.componentHelper.createComponent(ChartOverlayComponent, {
      chartConnfiguration: chartConfig,
      idChart: idOverlay,
      close: this.userClosedOverlay,
      listFiles: this.userListFilesToDownload
    });

    this.componentHelper.appendComponent(elementChart, this.downlodListOverlays?.nativeElement);

    let overlayExport = new Overlay({
      position: centerOfRoi,
      positioning: OverlayPositioning.CENTER_CENTER,
      element: elementChart.location.nativeElement,
      id: idOverlay
    });

    mapHelper.map?.addOverlay(overlayExport);

    this.listOfChartsInMap[idOverlay] = listData;
  }

  closeAllChartsInMap() {
    for (const key in this.listOfChartsInMap) {
      if (this.listOfChartsInMap.hasOwnProperty(key)) {
        this.closeChart(key);
      }
    }
  }

  constructLayerToDisplayResult() {
    this.removeLayerExportData();

    let layerExport = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: '#000',
          width: 2
        }),
        fill: new Fill({
          color: environment.primarycolor
        })
      }),
      updateWhileAnimating: true,
      //@ts-ignore
      activeLayers: {
        opacity: false,
        metadata: false,
        share: false
      },
      type_layer: 'exportData',
      nom: 'exportData'
    });

    layerExport.set('iconImagette', environment.url_frontend + '/assets/icones/draw.svg');
    layerExport.set('inToc', false);
    layerExport.setZIndex(1000);

    return layerExport;
  }

  enableDownloadBtn(): boolean {
    if (this.downloadModel.layers.length > 0 && this.downloadModel.roiGeometry) {
      return true;
    } else {
      return false;
    }
  }
}
