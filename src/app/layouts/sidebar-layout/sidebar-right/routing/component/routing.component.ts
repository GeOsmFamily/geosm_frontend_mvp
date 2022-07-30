
import { TranslateService } from '@ngx-translate/core';
import { CircleStyle, Draw, Feature, Fill, Geometry, Icon, Map, Polyline, Stroke, Style, Transform, VectorLayer, VectorSource } from 'src/app/core/modules/openlayers';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import GeometryType from 'ol/geom/GeometryType';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoutingService } from '../service/routing.service';
import { Route } from '../interfaces/route';
import * as moment from 'moment';

@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.scss']
})
export class RoutingComponent implements OnInit {
  @Input() map: Map | undefined;

  layerRouting: VectorLayer<VectorSource<Geometry>> | undefined;

  sourceRouting: VectorSource | undefined;

  drawRouting: Draw | undefined;

  data_itineraire: {
    depart: {
      coord: number[];
      nom: string;
      set: boolean;
    };
    destination: {
      coord: number[];
      nom: string;
      set: boolean;
    };
    passage: {
      coord: number[];
      nom: string;
      set: boolean;
    };
    route: {
      data: Route | undefined;
      loading: boolean;
      set: boolean;
    };
  } = {
    depart: {
      nom: '',
      coord: [],
      set: false
    },
    destination: {
      nom: '',
      coord: [],
      set: false
    },
    passage: {
      nom: '',
      coord: [],
      set: false
    },
    route: {
      loading: false,
      set: false,
      data: undefined
    }
  };
  constructor(
    public translate: TranslateService,
    public _ngZone: NgZone,
    private _snackBar: MatSnackBar,
    public routingService: RoutingService
  ) {}

  ngOnInit(): void {
    this.inittialiseRouting();
  }

  inittialiseRouting() {
    this.sourceRouting = new VectorSource({ wrapX: false });
    this.layerRouting = new VectorLayer({
      source: this.sourceRouting,
      //@ts-ignore
      style: (feature: Feature) => {
        if (feature.getGeometry()!.getType() == 'Point') {
          if (feature.get('data') == 'depart') {
            return new Style({
              image: new Icon({
                src: 'assets/images/svg/routing/depart.svg',
                scale: 2
              })
            });
          } else if (feature.get('data') == 'passage') {
            return new Style({
              image: new Icon({
                src: 'assets/images/svg/routing/passage.svg',
                scale: 2
              })
            });
          } else {
            return new Style({
              image: new Icon({
                src: 'assets/images/svg/routing/itineraire-arrivee_icone.svg',
                scale: 1
              })
            });
          }
        } else {
          return new Style({
            stroke: new Stroke({
              width: 6,
              color: environment.primarycolor
            })
          });
        }
      },
      type_layer: 'routing',
      nom: 'routing'
    });

    this.layerRouting.set('inToc', false);
    this.layerRouting.setZIndex(1000);
    this.map?.addLayer(this.layerRouting);
  }

  setPositionOfMarker(type: string) {
    let color: string;
    if (type == 'depart' || type == 'passage') {
      color = 'rgb(0, 158, 255)';
    } else {
      color = 'rgb(255, 107, 0)';
    }
    if (this.drawRouting) {
      this.map?.removeInteraction(this.drawRouting);
    }

    this.drawRouting = new Draw({
      source: this.sourceRouting,
      type: GeometryType.POINT,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: color
          })
        })
      })
    });

    this.map?.addInteraction(this.drawRouting);

    this.translate.get('notifications').subscribe((res: any) => {
      this._snackBar.open(res.click_on_map_itineraire, res.cancel, {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center'
      });

      this.drawRouting!.on('drawend', e => {
        this._ngZone.run(() => {
          //@ts-ignore
          let coord = e.feature.getGeometry()?.getCoordinates();
          let coord_4326 = Transform(coord, 'EPSG:3857', 'EPSG:4326');
          let feat_to_remove;

          for (let index = 0; index < this.layerRouting!.getSource()!.getFeatures().length; index++) {
            const my_feat = this.layerRouting!.getSource()!.getFeatures()[index];
            if (my_feat.get('data') == type) {
              feat_to_remove = my_feat;
            }
          }

          if (feat_to_remove) {
            this.layerRouting!.getSource()!.removeFeature(feat_to_remove);
          }
          e.feature.set('data', type);
          //@ts-ignore
          this.data_itineraire[type]['coord'] = coord_4326;
          //@ts-ignore
          this.data_itineraire[type]['set'] = true;

          this.routingService.nominatimReverse(coord_4326[1].toString(), coord_4326[0].toString()).subscribe(data => {
            let name = data.display_name.split(',')[0];
            //@ts-ignore
            this.data_itineraire[type]['nom'] = name;
          });
          this.calculate_itineraire();
          this.map?.removeInteraction(this.drawRouting!);
        });
      });
    });
  }

  calculate_itineraire() {
    if (
      this.data_itineraire.depart.coord.length == 2 &&
      this.data_itineraire.destination.coord.length == 2 &&
      this.data_itineraire.passage.coord.length == 2
    ) {
      let a = this.data_itineraire.depart.coord;
      let b = this.data_itineraire.destination.coord;
      let c = this.data_itineraire.passage.coord;
      this.data_itineraire.route.loading = true;
      this.data_itineraire.route.set = false;
      this.routingService.getRoute(a, b, c).subscribe(data => {
        this.data_itineraire.route.loading = false;

        if (data['routes'] && data['routes'].length > 0) {
          this.data_itineraire.route.data = data;
          this.display_itineraire(data);
        }
      });
    } else if (this.data_itineraire.depart.coord.length == 2 && this.data_itineraire.destination.coord.length == 2) {
      let a = this.data_itineraire.depart.coord;
      let b = this.data_itineraire.destination.coord;
      this.data_itineraire.route.loading = true;
      this.data_itineraire.route.set = false;
      this.routingService.getRoute(a, b).subscribe(route => {
        this.data_itineraire.route.loading = false;

        if (route['routes'] && route['routes'].length > 0) {
          this.data_itineraire.route.data = route;
          this.display_itineraire(route);
        }
      });
    }
  }

  display_itineraire(data:Route) {
    let route = new Polyline({
      factor: 1e5
    }).readGeometry(data.routes[0].geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    let newMarker = new Feature({
      data: 'route',
      geometry: route
    });

    let feat_to_remove;
    for (let index = 0; index < this.layerRouting!.getSource()!.getFeatures().length; index++) {
      const my_feat = this.layerRouting!.getSource()!.getFeatures()[index];
      if (my_feat.get('data') == 'route') {
        feat_to_remove = my_feat;
      }
    }

    if (feat_to_remove) {
      this.layerRouting!.getSource()!.removeFeature(feat_to_remove);
    }
    this.data_itineraire.route.set = true;
    this.layerRouting!.getSource()!.addFeature(newMarker);
  }

  formatTimeInineraire(timesSecondes: number): string {
    let duration = moment.duration(timesSecondes, 'seconds');
    let hours = '0' + duration.hours();
    let minutes = '0' + duration.minutes();
    return hours.slice(-2) + 'h' + minutes.slice(-2);
  }

  formatDistance(distanceMeters: number): string {
    let distanceKm = distanceMeters / 1000;
    return distanceKm.toFixed(2);
  }

  clear_itineraire() {
    this.layerRouting!.getSource()!.clear();
    this.data_itineraire.route.set = false;
    this.data_itineraire.depart.coord = [];
    this.data_itineraire.depart.nom = '';
    this.data_itineraire.destination.coord = [];
    this.data_itineraire.destination.nom = '';
    this.data_itineraire.passage.coord = [];
    this.data_itineraire.passage.nom = '';
  }
}
