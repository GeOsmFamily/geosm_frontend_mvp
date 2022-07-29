import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import {
  boundingExtent,
  CircleStyle,
  Cluster,
  createStringXY,
  Fill,
  GeoJSON,
  Icon,
  ImageLayer,
  ImageWMS,
  LayerGroup,
  Map,
  MousePosition,
  RasterSource,
  ScaleLine,
  Stroke,
  Style,
  Text,
  TileLayer,
  TileWMS,
  transformExtent,
  VectorLayer,
  VectorSource,
  XYZ,
  BaseLayer
} from 'src/app/core/modules/openlayers';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AppInjector } from 'src/app/core/injectorHelper';
import { map as geoportailMap } from '../components/map.component';
import * as jQuery from 'jquery';
import { Extent } from 'ol/extent';
import { SimpleGeometry } from 'ol/geom';
import { GeosmLayer } from '../interfaces/geosmlayer';
import { delayWhen, retryWhen, take, tap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LayersInMap } from '../interfaces/layerinmap';
import { ActiveLayersInterface } from '../interfaces/activelayers';
import { bboxPolygon, intersect, toWgs84 } from '@turf/turf';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';

const typeLayer = ['geosmCatalogue', 'draw', 'mesure', 'mapillary', 'exportData', 'comments', 'other', 'routing', 'searchResultLayer'];

@Injectable()
export class MapHelper {
  map: Map | undefined;
  environment = environment;
  apiService: ApiService = AppInjector.get(ApiService);

  constructor(map?: Map) {
    if (map) {
      this.map = map;
    } else {
      this.map = geoportailMap;
    }
  }

  static scaleControl(scaleType: 'scaleline' | 'scalebar', target: string): ScaleLine {
    let scaleBarSteps = 4;
    let scaleBarText = true;
    let control: ScaleLine | undefined;
    if (scaleType === 'scaleline') {
      control = new ScaleLine({
        units: 'metric', //'metric','nautical','us','degrees'
        target: target
      });
    } else if (scaleType === 'scalebar') {
      control = new ScaleLine({
        units: 'metric',
        target: target,
        bar: true,
        steps: scaleBarSteps,
        text: scaleBarText,
        minWidth: 140
      });
    }
    return control!;
  }

  static mousePositionControl(target: string): MousePosition {
    let mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      target: document.getElementById(target)!,
      undefinedHTML: 'WGS 84'
    });
    return mousePositionControl;
  }

  //@ts-ignore
  constructShadowLayer(geojsonLayer: Object): BaseLayer {
    let worldGeojson = {
      type: 'FeatureCollection',
      name: 'world_shadow',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } },
      features: [
        {
          type: 'Feature',
          properties: { id: 0 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-19824886.222640071064234, 19848653.805728208273649],
                [19467681.065475385636091, 19467681.065475385636091],
                [19753445.191207133233547, -15987945.626927629113197],
                [-19824886.222640071064234, -15967070.525261469185352],
                [-19824886.222640071064234, 19848653.805728208273649]
              ]
            ]
          }
        }
      ]
    };

    let featureToShadow = new GeoJSON().readFeatures(geojsonLayer, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    let featureWorld = new GeoJSON().readFeatures(worldGeojson);

    let rasterSource_world = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: [0, 0, 0, 0.6]
        })
      })
    });

    let rasterSource_cmr = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: [0, 0, 0, 0.1]
        })
      })
    });

    rasterSource_world.getSource()!.addFeatures(featureWorld);
    rasterSource_cmr.getSource()!.addFeatures(featureToShadow);

    let raster = new RasterSource({
      sources: [rasterSource_world, rasterSource_cmr],
      operation: function (pixels) {
        //@ts-ignore
        if (pixels[1][3] == 0) {
          return pixels[0];
        } else {
          return [0, 0, 0, 1];
        }
      }
    });

    let rasterLayer = new ImageLayer({
      source: raster,
      className: 'map-shadow'
    });

    return rasterLayer;
  }

  //lister les id contenus dans un VectorSource
  public static listIdFromSource(source: VectorSource): Array<string> {
    let response = Array();
    for (let index = 0; index < source.getFeatures().length; index++) {
      const feat = source.getFeatures()[index];
      response.push(feat.getId());
    }
    return response;
  }

  //recuperer la bbox actuelle de la carte sur l'ecran
  getCurrentMapExtent() {
    try {
      let coord_O_N = this.map?.getCoordinateFromPixel([jQuery('.mat-sidenav .sidenav-left').width()!, jQuery(window).height()!]);
      let coord_E_S = this.map?.getCoordinateFromPixel([jQuery(window).width()!, 0]);
      let extent_view = boundingExtent([coord_O_N!, coord_E_S!]);
      return extent_view;
    } catch (error) {
      let extent_view_error = this.map?.getView().calculateExtent();
      return extent_view_error;
    }
  }

  fit_view(geom: Extent | SimpleGeometry, zoom: any) {
    this.map?.getView().fit(geom, {
      maxZoom: zoom,
      size: this.map!.getSize(),
      padding: [0, 0, 0, 0],
      duration: 1000
    });
  }

  setZindexToLayer(layer: any, zIndex: number) {
    layer.setZIndex(zIndex);
    if (layer instanceof LayerGroup) {
      for (let index = 0; index < layer.getLayers().getArray().length; index++) {
        layer.getLayers().getArray()[index].setZIndex(zIndex);
      }
    }
  }

  addLayerToMap(layer: BaseLayer) {
    if (!layer.get('nom')) {
      throw new Error("Layer must have a 'nom' properties");
    }

    if (!layer.get('type_layer')) {
      throw new Error("Layer must have a 'type_layer' properties");
    }

    if (typeLayer.indexOf(layer.get('type_layer')) == -1) {
      throw new Error("Layer must have a 'type_layer' properties among " + typeLayer.join(','));
    }

    let zIndex = this.getMaxZindexInMap() + 1;

    if (layer.get('nom') && layer.get('type_layer')) {
      if (!layer.getZIndex()) {
        this.setZindexToLayer(layer, zIndex);
      }

      this.map?.addLayer(layer);
      this.map?.renderSync();
    }
  }

  removeLayerToMap(layer: BaseLayer) {
    this.map?.removeLayer(layer);
  }

  getMaxZindexInMap(): number {
    let allLayers = this.map?.getLayers().getArray();

    let allZindex = [0];
    for (let index = 0; index < allLayers!.length; index++) {
      let layer = allLayers![index];

      try {
        if (layer.get('inToc')) {
          allZindex.push(layer.getZIndex());
        }
      } catch (error) {
        console.error(error);
      }
    }
    return Math.max(...allZindex);
  }

  constructLayer(couche: GeosmLayer) {
    let layer: BaseLayer | undefined;
    if (couche.type == 'xyz') {
      layer = new TileLayer({
        source: new XYZ({
          url: couche.url,
          maxZoom: couche.maxzoom,
          minZoom: couche.minzoom,
          crossOrigin: 'anonymous',
          attributionsCollapsible: false,
          attributions: ' © contributeurs <a target="_blank" href="https://www.openstreetmap.org/copyright"> OpenStreetMap </a> '
        }),

        className: couche.nom + '___' + couche.type_layer
      });
    } else if (couche.type == 'wms') {
      let wmsSourceTile = new TileWMS({
        url: couche.url,
        params: { LAYERS: couche.identifiant, TILED: true },
        serverType: 'qgis',
        crossOrigin: 'anonymous'
      });

      let layerTile = new TileLayer({
        source: wmsSourceTile,
        className: couche.nom + '___' + couche.type_layer,
        minResolution: this.map?.getView().getResolutionForZoom(9)
      });

      let wmsSourceImage = new ImageWMS({
        url: couche.url!,
        params: { LAYERS: couche.identifiant, TILED: true },
        serverType: 'qgis',
        crossOrigin: 'anonymous'
      });

      let layerImage = new ImageLayer({
        source: wmsSourceImage,

        className: couche.nom + '___' + couche.type_layer,
        maxResolution: this.map?.getView().getResolutionForZoom(9)
      });

      layer = new LayerGroup({
        layers: [layerTile, layerImage]
      });
    } else if (couche.type == 'wfs') {
      let source = new VectorSource({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }),
        loader: () => {
          let extent_view = this.getCurrentMapExtent();
          let url =
            couche.url +
            '?bbox=' +
            transformExtent(extent_view!, 'EPSG:3857', 'EPSG:4326').join(',') +
            '&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&outputFormat=GeoJSON&typeName=' +
            couche.identifiant;
          this.apiService
            .getRequestFromOtherHostObserver(url)
            .pipe(
              /** retry 3 times after 2s if querry failed  */
              retryWhen(errors =>
                errors.pipe(
                  tap((_val: HttpErrorResponse) => {}),
                  delayWhen((_val: HttpErrorResponse) => timer(2000)),
                  take(3)
                )
              )
            )
            .subscribe(
              data => {
                // @ts-ignore
                source.addFeatures(source.getFormat()?.readFeatures(data)!);
                for (let index = 0; index < source.getFeatures().length; index++) {
                  const feature = source.getFeatures()[index];
                  feature.set('featureId', feature.getId());
                }
              },
              (_err: HttpErrorResponse) => {
                source.removeLoadedExtent(extent_view!);
              }
            );
        }
      });

      layer = new VectorLayer({
        source: source,
        style: new Style({
          image: new Icon({
            scale: couche.size,
            src: couche.icon
          })
        }),

        className: couche.nom + '___' + couche.type_layer
      });

      if (couche.cluster) {
        let clusterSource = new Cluster({
          distance: 80,
          source: source
        });
        let styleCache = {};
        let styleCacheCopy = {};
        layer = new VectorLayer({
          source: clusterSource,
          // @ts-ignore
          style: feature => {
            let size = feature.get('features').length;

            if (size > 1) {
              // @ts-ignore
              let styleDefault = styleCache[size];
              if (!styleDefault) {
                let radius = 10;
                if (size > 99) {
                  (radius = 12), 5;
                }
                styleDefault = new Style({
                  text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                      color: '#fff'
                    }),
                    font: '12px sans-serif',
                    offsetY: 1,
                    offsetX: -0.5
                  }),
                  image: new CircleStyle({
                    radius: radius,

                    stroke: new Stroke({
                      color: '#fff',
                      width: 2
                    }),
                    fill: new Fill({
                      color: environment.primarycolor
                    })
                  })
                  /*  */
                });
                // @ts-ignore
                styleCache[size] = styleDefault;
              }

              return [
                new Style({
                  image: new Icon({
                    scale: couche.size,
                    src: couche.icon
                  })
                }),
                styleDefault
              ];
            } else if (size == 1) {
              return new Style({
                image: new Icon({
                  scale: couche.size,
                  src: couche.icon
                })
              });
            } else if (size == 0) {
              return;
            }
          },

          className: couche.nom + '___' + couche.type_layer
        });
      }
    }

    this.setPropertiesToLayer(layer!, couche);

    if (couche.zindex) {
      this.setZindexToLayer(layer, couche.zindex);
    }

    if (couche.minzoom) {
      layer!.setMinResolution(this.map?.getView().getResolutionForZoom(couche.minzoom)!);
    }

    if (couche.maxzoom) {
      layer!.setMaxResolution(this.map?.getView().getResolutionForZoom(couche.maxzoom)!);
    }

    layer!.setVisible(couche.visible);

    return layer;
  }

  setPropertiesToLayer(layer: BaseLayer, couche: GeosmLayer) {
    if (layer instanceof LayerGroup) {
      for (let index = 0; index < layer.getLayers().getArray().length; index++) {
        const element = layer.getLayers().getArray()[index];
        element.set('properties', couche.properties);
        element.set('nom', couche.nom);
        element.set('type_layer', couche.type_layer);
        element.set('iconImagette', couche.iconImagette);
        element.set('identifiant', couche.identifiant);
        element.set('inToc', couche.inToc);
        element.set('activeLayers', couche.activeLayers);
        element.set('legendCapabilities', couche.legendCapabilities);
        element.set('descriptionSheetCapabilities', couche.descriptionSheetCapabilities);
      }
    }

    layer.set('properties', couche.properties);
    layer.set('nom', couche.nom);
    layer.set('type_layer', couche.type_layer);
    layer.set('iconImagette', couche.iconImagette);
    layer.set('identifiant', couche.identifiant);
    layer.set('inToc', couche.inToc);
    layer.set('activeLayers', couche.activeLayers);
    layer.set('legendCapabilities', couche.legendCapabilities);
    layer.set('descriptionSheetCapabilities', couche.descriptionSheetCapabilities);
  }

  getLayerByPropertiesCatalogueGeosm(properties: { group_id: number; couche_id: number; type: 'couche' | 'carte' }): Array<any> {
    let layer_to_remove = Array();
    let all_layers = this.getAllLayerInMap();
    for (let index = 0; index < all_layers.length; index++) {
      let layer = all_layers[index];
      if (layer.get('properties')) {
        if (
          layer.get('properties')['type'] == properties.type &&
          layer.get('properties')['group_id'] == properties.group_id &&
          layer.get('properties')['couche_id'] == properties.couche_id
        ) {
          layer_to_remove.push(layer);
        }
      }
    }

    return layer_to_remove;
  }

  getAllLayerInMap(): Array<BaseLayer> {
    let responseLayers = Array();
    this.map?.getLayers().forEach(group => {
      responseLayers.push(group);
    });
    return responseLayers;
  }

  getLayerByName(name: string, isLayerGroup: boolean = false): Array<any> {
    let layer_to_remove = Array();
    let all_layers: Array<BaseLayer> | undefined;

    if (isLayerGroup) {
      all_layers = this.map?.getLayers().getArray();
    } else {
      all_layers = this.map?.getLayerGroup().getLayers().getArray();
    }

    for (let index = 0; index < all_layers!.length; index++) {
      let layer = all_layers![index];
      if (layer.get('nom') == name) {
        layer_to_remove.push(layer);
      }
    }
    return layer_to_remove;
  }

  getAllLayersInToc(): Array<LayersInMap> {
    let reponseLayers: Array<LayersInMap> = [];
    let allLayers = this.map?.getLayers().getArray();

    for (let index = 0; index < allLayers!.length; index++) {
      const layer = allLayers![index];
      if (layer.get('inToc')) {
        reponseLayers.push(this.constructLayerInMap(layer));
      }
    }

    return reponseLayers;
  }

  constructLayerInMap(layer: any): LayersInMap {
    let data = null;
    let activeLayers: ActiveLayersInterface = {} as ActiveLayersInterface;
    if (layer.get('tocCapabilities')) {
      activeLayers.opacity = layer.get('tocCapabilities')['opacity'] != undefined ? layer.get('tocCapabilities')['opacity'] : true;
      activeLayers.share = layer.get('tocCapabilities')['share'] != undefined ? layer.get('tocCapabilities')['share'] : true;
      activeLayers.metadata = layer.get('tocCapabilities')['metadata'] != undefined ? layer.get('tocCapabilities')['metadata'] : true;
    } else {
      activeLayers.opacity = true;
      activeLayers.share = true;
      activeLayers.metadata = true;
    }
    return {
      activeLayers: activeLayers,
      legendCapabilities: layer.get('legendCapabilities'),
      nom: layer.get('nom'),
      type_layer: layer.get('type_layer'),
      properties: layer.get('properties'),
      image: layer.get('iconImagette'),
      data: data,
      zIndex: layer.getZIndex(),
      visible: layer.getVisible(),
      layer: layer,
      descriptionSheetCapabilities: layer.get('descriptionSheetCapabilities')
    };
  }

  editZindexOfLayer(layer: BaseLayer, zIndex: number) {
    for (let index = 0; index < this.getAllLayersInToc().length; index++) {
      const layerInmap = this.getAllLayersInToc()[index].layer;
      if (layer.getZIndex() < zIndex) {
        // if the layer is going up
        if (layerInmap.getZIndex() <= zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() - 1);
        } else if (layerInmap.getZIndex() > zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() + 1);
        }
      } else if (layer.getZIndex() > zIndex) {
        // if the layer is going down
        if (layerInmap.getZIndex() >= zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() + 1);
        } else if (layerInmap.getZIndex() < zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() - 1);
        }
      }
    }
    this.setZindexToLayer(layer, zIndex);
  }

  getLayerQuerryInLayerGroup(layer: LayerGroup): any {
    if (layer instanceof LayerGroup) {
      for (let index = 0; index < layer.getLayers().getArray().length; index++) {
        const element = layer.getLayers().getArray()[index];
        if (element instanceof TileLayer) {
          return element;
        } else if (element instanceof VectorLayer) {
          return element;
        }
      }
    } else {
      return layer;
    }
  }

  getLayerGroupByNom(groupName: string): LayerGroup {
    let groupLayer: LayerGroup | undefined;
    this.map?.getLayers().forEach(group => {
      if (group instanceof LayerGroup) {
        if (group.get('nom') == groupName) {
          groupLayer = group;
        }
      }
    });
    return groupLayer!;
  }

  initMapProject(project: ProjectInterface) {
    let shadowlayer = this.constructShadowLayer(project.config.roiGeojson);
    shadowlayer.setZIndex(1000);
    this.map?.addLayer(shadowlayer);

    this.map?.getView().fit(project.config.data.instance.bbox, {
      size: this.map.getSize(),
      duration: 1000
    });

    this.map?.on('moveend', () => {
      let bbox_cam = bboxPolygon(
        //@ts-ignore
        project.config.data.instance.bbox
      );
      //@ts-ignore
      let bbox_view = bboxPolygon(this.map.getView().calculateExtent());

      let bool = intersect(toWgs84(bbox_view), toWgs84(bbox_cam));

      if (!bool) {
        this.map?.getView().fit(project.config.data.instance.bbox, {
          size: [this.map.getSize()?.[0]!, this.map.getSize()?.[1]! - 50],
          duration: 1000
        });
      }
    });
    this.map?.updateSize();
  }

  addPrincipalMap(principalMap: PrincipalMapInterface) {
    let groupCarte = principalMap.groupecarte;
    let carte = principalMap.carte;
    let type: 'wms' | 'wfs' | 'xyz' | undefined;
    if (carte.type == 'wms') {
      type = 'wms';
    } else if (carte.type == 'xyz') {
      type = 'xyz';
    }
    let layer = this.constructLayer({
      nom: carte.nom,
      type: type!,
      type_layer: 'geosmCatalogue',
      url: carte.url,

      visible: true,
      inToc: true,
      properties: {
        group_id: groupCarte.id,
        couche_id: carte.id,
        type: 'carte'
      },
      activeLayers: {
        share: false,
        metadata: true,
        opacity: true
      },
      iconImagette: environment.url_services + carte.image_url,
      descriptionSheetCapabilities: undefined!
    });
    this.addLayerToMap(layer!);
  }

  removePrincipalMap(principalMap: PrincipalMapInterface) {
    let layer = this.getLayerByPropertiesCatalogueGeosm({
      group_id: principalMap!.groupecarte.id,
      couche_id: principalMap!.carte.id,
      type: 'carte'
    });
    for (let index = 0; index < layer.length; index++) {
      this.removeLayerToMap(layer[index]);
    }
  }

  addMapZoomAnimation = (zoom: number) => {
    this.map?.getView().animate({
      zoom: zoom,
      duration: 1000
    });
  };
}
