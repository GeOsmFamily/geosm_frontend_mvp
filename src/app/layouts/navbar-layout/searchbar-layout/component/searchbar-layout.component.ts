import { Extent } from 'ol/extent';
import {
  BaseLayer,
  Feature,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
  VectorLayer,
  VectorSource,
  Point,
  Polygon,
  transformExtent,
  transform
} from 'src/app/core/modules/openlayers';
import { selectIsLoading } from './../../../sidebar-layout/map/states/map.selector';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { SearchInterface } from '../interfaces/search';
import { SearchState } from '../states/search.reducer';
import { selectSearch } from '../states/search.selector';
import { searchQuery } from '../states/search.actions';
import { LayersService } from 'src/app/core/services/geosm/layers.service';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import { environment } from 'src/environments/environment';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { transformWithProjections } from 'ol/proj';

@Component({
  selector: 'app-searchbar-layout',
  templateUrl: './searchbar-layout.component.html',
  styleUrls: ['./searchbar-layout.component.scss']
})
export class SearchbarLayoutComponent implements OnInit {
  result: string = '';
  showResults: boolean = false;
  results$: Observable<SearchInterface[]>;
  isLoading$: Observable<boolean>;
  private searchText$ = new Subject<string>();
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  @Output() selected: EventEmitter<SearchInterface | null> = new EventEmitter<SearchInterface | null>();

  searchResultLayer: BaseLayer = new VectorLayer({
    source: new VectorSource(),
    style: feature => {
      let textLabel;
      let textStyle = {
        font: '15px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#000', width: 1 }),
        padding: [10, 10, 10, 10],
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
          width: 6
        }),
        image: new Icon({
          scale: 0.7,
          src: '/assets/images/png/marker-search.png'
        }),
        text: new Text(textStyle)
      });
    },
    //@ts-ignore
    type_layer: 'searchResultLayer',
    nom: 'searchResultLayer'
  });

  constructor(
    private store: Store<SearchState>,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public layersService: LayersService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.results$ = this.store.pipe(select(selectSearch));
    this.isLoading$ = this.store.pipe(select(selectIsLoading));
  }
  ngOnInit(): void {
    this.initialiseSearchResultLayer();
  }

  initialiseSearchResultLayer() {
    let mapHelper = new MapHelper();
    if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
      this.searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];
      this.searchResultLayer.setZIndex(1000);
    } else {
      this.searchResultLayer.setZIndex(1000);
      mapHelper.map?.addLayer(this.searchResultLayer);
    }
    if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
      mapHelper.getLayerByName('searchResultLayer')[0].getSource().clear();
    }
  }

  search(name: string): void {
    this.showResults = name.length >= 3;
    this.searchText$.next(name);
    this.store.dispatch(searchQuery({ query: name }));

    this.results$.subscribe(results => {
      console.log(results);
    });
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onSelect(result: SearchInterface): void {
    this.result = `${result.name}`;
    this.showResults = false;
    this.selected.emit(result);
    if (result.couche) {
      this.selectedCouche(result);
    } else {
      this.selectNominatim(result);
    }
  }

  onClear(): void {
    this.result = '';
    this.showResults = false;
    this.selected.emit(null);

    let mapHelper = new MapHelper();
    if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
      let searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];

      searchResultLayer.getSource().clear();
    }
  }

  getConnectedOverlayPanelClasses(): string[] {
    if (this.mobileQuery.matches) {
      return ['fixed', '!bottom-0', '!left-0', '!right-0'];
    }

    return [];
  }

  getOverlayWidth(): number | string {
    if (this.mobileQuery.matches) {
      return '100%';
    }

    return 360;
  }

  getOverlayOffset(): number {
    if (this.mobileQuery.matches) {
      return 0;
    }

    return 10;
  }

  selectedCouche(result: SearchInterface) {
    this.layersService.addLayerCouche(result.couche!);
  }

  selectNominatim(result: SearchInterface) {
    result;
    let mapHelper = new MapHelper();

    if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
      let searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];

      let feature = new Feature();
      let textLabel = result.name;

      feature.set('textLabel', textLabel);
      let extent: Extent;
      if (result.geometry.type == 'Point') {
        let coordinates = transform(result.geometry.coordinates, 'EPSG:4326', 'EPSG:3857');
        feature.setGeometry(new Point(coordinates));
        extent = new Point(coordinates).getExtent();
      } else if (result.geometry.type == 'Polygon') {
        for (let index = 0; index < result.geometry.coordinates[0].length; index++) {
          const element = result.geometry.coordinates[0][index];
          result.geometry.coordinates[0][index] = transform(element, 'EPSG:4326', 'EPSG:3857');
        }
        feature.setGeometry(new Polygon(result.geometry.coordinates));
        extent = new Polygon(result.geometry.coordinates).getExtent();
      }

      searchResultLayer.getSource().clear();

      searchResultLayer.getSource().addFeature(feature);

      mapHelper.fit_view(extent!, 16);
    }
  }
}
