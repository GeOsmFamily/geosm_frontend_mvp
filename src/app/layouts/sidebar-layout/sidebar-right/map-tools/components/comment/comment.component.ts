import { CommentService } from './../../services/comment.service';
import {
  BaseLayer,
  Feature,
  Icon,
  Map,
  Overlay,
  Point,
  Style,
  VectorLayer,
  VectorSource,
  Geometry,
  GeoJSON
} from 'src/app/core/modules/openlayers';
import { Component, Input, NgZone } from '@angular/core';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { transform } from 'ol/proj';
import { MapBrowserEvent } from 'ol';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() map: Map | undefined;

  newMarker: any;

  responseComment: any;

  checked = false;

  isLoading = false;

  vectorLayer: BaseLayer | undefined;
  layer_commentsPoint: VectorLayer<VectorSource<Geometry>> | undefined;

  constructor(private zone: NgZone, private commentService: CommentService) {}

  displayComments() {
    let mapHelper = new MapHelper();
    if (!this.checked) {
      this.isLoading = true;
      this.commentService.getAllComments().subscribe(commentInterface => {
        let responses = Array();

        commentInterface.data.comments.forEach(element => {
          let geometry = {
            type: 'Point',
            coordinates: [element.longitude, element.latitude]
          };

          responses.push({
            type: 'Feature',
            geometry: geometry,
            properties: element
          });
        });

        let geojson = {
          type: 'FeatureCollection',
          features: responses
        };

        let point = Array();

        for (let i = 0; i < geojson.features.length; i++) {
          for (let j = 0; j < geojson.features[i].geometry.coordinates.length; j++) {
            let coord = transform(geojson.features[i].geometry.coordinates[j], 'EPSG:4326', 'EPSG:3857');

            this.newMarker = new Feature({
              geometry: new Point(coord),
              data: { i: i, j: j, type: 'point' }
            });

            point.push(this.newMarker);
          }
        }

        let vectorFeature = new GeoJSON().readFeatures(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        let vectorSource = new VectorSource({
          features: point
        });

        vectorSource.addFeatures(vectorFeature);

        this.vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new Icon({
              crossOrigin: 'anonymous',
              src: 'assets/images/svg/map-pin-default.svg',
              scale: 1
            })
          })
        });

        if (this.layer_commentsPoint) {
          this.layer_commentsPoint.getSource()!.clear();
          this.layer_commentsPoint.setSource(vectorSource);
        }

        this.vectorLayer.set('name', 'comments');
        this.vectorLayer.set('nom', 'comments');
        this.vectorLayer.set('type', 'comments');
        this.vectorLayer.set('type_layer', 'comments');
        this.vectorLayer.setZIndex(mapHelper.getMaxZindexInMap() + 1);

        mapHelper.addLayerToMap(this.vectorLayer);
        this.isLoading = false;

        this.zone?.run(() => {
          this.responseComment = commentInterface;
        });
      });

      this.map?.on('singleclick', e => {
        this.map?.forEachLayerAtPixel(e.pixel, layer => {
          if (this.checked && layer.get('type') == 'comments') {
            this.displayPopupComment(e);
          }
        });
      });
    } else {
      mapHelper.removeLayerToMap(this.vectorLayer!);
    }
  }

  displayPopupComment(e: MapBrowserEvent<UIEvent>) {
    let feature = this.map?.forEachFeatureAtPixel(e.pixel, (featureLike, _layer) => {
      return featureLike;
    });

    let container = document.getElementById('popup');
    let content = document.getElementById('popup-content');
    let closer = document.getElementById('popup-closer');
    container!.style.display = 'inline';
    let overlay = new Overlay({
      element: container!,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    closer!.onclick = function () {
      overlay.setPosition(undefined!);
      closer?.blur();
      return false;
    };
    this.map?.addOverlay(overlay);

    let coordinate = e.coordinate;

    content!.innerHTML =
      '<p><b>Auteur : </b>' +
      feature?.getProperties().user.last_name +
      '</p>' +
      '<p><b>Email : </b>' +
      feature?.getProperties().user.email +
      '</p>' +
      '<p><b>Commentaire : </b>' +
      feature?.getProperties().commentaire;
    overlay.setPosition(coordinate);
  }
}
