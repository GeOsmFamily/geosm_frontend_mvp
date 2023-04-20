import { LayersService } from './../../../../core/services/geosm/layers.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PradecService } from 'src/app/core/services/geosm/pradec/pradec.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/core/services/api/api.service';
import { SearchService } from 'src/app/layouts/navbar-layout/searchbar-layout/service/search.service';
import { environment } from 'src/environments/environment';
import { MapHelper } from '../../map/helpers/maphelper';
import {
  CircleStyle,
  Cluster,
  Feature,
  Fill,
  GeoJSON,
  Icon,
  Point,
  Polygon,
  Stroke,
  Style,
  Text,
  transform,
  VectorLayer,
  VectorSource
} from 'src/app/core/modules/openlayers';
import { Extent } from 'ol/extent';
import { PradecInterface } from 'src/app/core/interfaces/pradec';
import { select, Store } from '@ngrx/store';
import { SearchState } from 'src/app/layouts/navbar-layout/searchbar-layout/states/search.reducer';
import { Observable, filter } from 'rxjs';
import { SearchInterface } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/search';
import { selectSearch } from 'src/app/layouts/navbar-layout/searchbar-layout/states/search.selector';
import { searchQuery } from 'src/app/layouts/navbar-layout/searchbar-layout/states/search.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from 'src/app/core/services/geosm/config/config.service';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;


  questions = [
    'Question 1',
   'Question 2',
   'Question3',
   'Question 4',
   'Question 5',
   'Question 6',
   'Question 7'
  ];
  selectedIndex: number | undefined;
  selectedCommune: number | undefined;
  selectedOuvrage: number | undefined;
  selectedSyndicat: number | undefined;

  ouvrageChecked?: string;
  syndicatChecked?: string;
  communeChecked?: string;
  questionChecked?: string;
  listDepartements = new Map<string, any>([]);
  listComunes = new Map<string, any[]>([]);

  showSyndicats = false;
  showCommunes = false;
  showOuvrages = false;
  form: FormGroup;
  forceSelected = false;

  //sélection de l'utilisateur
  syndicat: string | undefined;
  departement: string | undefined;
  commune  : string | undefined;
  ouvrage: string | undefined;
  auxi: string | undefined;

  //variables liées à ngModel, permettant de récupérer le choix de l'utilisateur
  nbdepartement: any;
  nbCommune = ['Toutes les communes'];
  // nbOuvrage=["Tous les ouvrages"]
  listeSyndicats = ['Tous les Syndicats'];

  list: string[] | undefined;
  results$: Observable<SearchInterface[]>;
  cameroun:any


  regions:any
  departements:any
  communes:any

  constructor(
    private store: Store<SearchState>,
    private formBuilder: FormBuilder,
    public searchService: SearchService,
    public pradecService: PradecService,
    public layerService: LayersService,
    private _snackBar: MatSnackBar,
    private apiService:ApiService
  ) {

    this.apiService.getRequestFromOtherHost('/assets/limites/cameroun.geojson').then(response => {
      if (response) {
        this.cameroun=response

       let region=this.cameroun.map((x:any )=> x.Column1 )
       this.regions = [...new Set(['Toutes les régions']), ...new Set(region)];


      } else {
        throw new Error();
      }
    })
    .catch(error => console.log('catch block in getData function'));


    this.results$ = this.store.pipe(select(selectSearch));

       this.form = this.formBuilder.group({});
  }

  getCdkConnectedOverlayPanelClasses(): string[] {
    return ['max-h-72', '-translate-y-8'];
  }
  toggleSyndicats() {
    this.showSyndicats = !this.showSyndicats;
  }

  toggleCommunes() {
   if(this.syndicat){
    this.showCommunes = !this.showCommunes;
   }
  }

  toggleOuvrages() {
    if(this.commune){
    this.showOuvrages = !this.showOuvrages;
    }
  }
  getSyndicats(): string[] {
    return Array.from(this.listDepartements.keys());
  }

  getDepartements(): any[] {
    return this.listDepartements.get(this.syndicat!);
  }

  getCommunes(): any[] | undefined {
    return this.listComunes.get(this.syndicat!);
  }

  selectNominatim(query: string) {
    this.searchService.searchNominatim(query).subscribe(results => {
      let mapHelper = new MapHelper();

      let searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];

      let feature = new Feature();
      /*   let textLabel = results[0].name;
        feature.set('textLabel', textLabel);*/
      let extent: Extent;
      if (results[0].geometry.type == 'Point') {
        let coordinates = transform(results[0].geometry.coordinates, 'EPSG:4326', 'EPSG:3857');
        feature.setGeometry(new Point(coordinates));
        extent = new Point(coordinates).getExtent();
      } else if (results[0].geometry.type == 'Polygon') {
        for (let index = 0; index < results[0].geometry.coordinates[0].length; index++) {
          const element = results[0].geometry.coordinates[0][index];
          results[0].geometry.coordinates[0][index] = transform(element, 'EPSG:4326', 'EPSG:3857');
        }
        feature.setGeometry(new Polygon(results[0].geometry.coordinates));
        extent = new Polygon(results[0].geometry.coordinates).getExtent();
      }

      searchResultLayer.getSource().clear();

      searchResultLayer.getSource().addFeature(feature);

      mapHelper.fit_view(extent!, 16);
    });
  }

  changeSelection(event: any, index: any) {
    if(this.syndicat && this.commune && this.ouvrage)
      this.selectedIndex = event.target.checked ? index : undefined;

    console.log(this.questions[this.selectedIndex!]);
    this.searchData(this.selectedIndex! + 1);
  }
  changeSyndicat(event: any, index: any) {
    this.selectedSyndicat = event.target.checked ? index : undefined;
    this.syndicat = this.regions[this.selectedSyndicat!];
    this.toggleSyndicats()

    if(this.syndicat !== 'Toutes les régions')
      this.selectNominatim(this.syndicat!);
    else{
      this.selectNominatim('cameroun')
    }
    //select departement of a specific region


    this.departements=[...new Set(this.cameroun.map((x:any )=> x.Column1 == this.syndicat ? x.Column2:'' ))]
    if (this.syndicat == 'Tous les syndicats') {
      let mapHelper = new MapHelper();
      let searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];
      searchResultLayer.getSource().clear();
    } else {
      if (this.syndicat == 'SYNCOBE') {
        this.selectNominatim('benoue');
      } else if (this.syndicat == 'SYNCOMALOU') {
        this.selectNominatim('mayo-louti');
      } else if (this.syndicat == 'SYDECOMAR') {
        this.selectNominatim('mayo-rey');
      }
    }

  }

  changeCommune(event: any, index: any) {
    this.selectedCommune = event.target.checked ? index : undefined;
    this.commune = this.departements![this.selectedCommune!];
    this.toggleCommunes()
    this.selectNominatim(this.commune!)


    //select departement of a specific commune


    this.communes=[...new Set(this.cameroun.map((x:any )=> x.Column2 == this.commune ? x.Column3:'' ))]

  }

  changeOuvrage(event: any, index: any) {
    this.selectedOuvrage = event.target.checked ? index : undefined;



    this.auxi = this.communes[this.selectedOuvrage!];
    this.toggleOuvrages()
    this.selectNominatim(this.auxi!)

  }

  selectCheckBoxSyndicat(targetType: any, index: number, list: any) {
    // If the checkbox was already checked, clear the currentlyChecked variable

    if (this.syndicatChecked === targetType) {

      this.syndicatChecked = '';

    }

    this.syndicatChecked = list[index];
  }

  selectCheckBoxCommune(targetType: any, index: number, list: any) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.communeChecked === targetType) {
      this.communeChecked = '';
    }

    this.communeChecked = list[index];
  }

  selectCheckBoxOuvrage(targetType: any, index: number, list: any) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.ouvrageChecked === targetType) {
      this.ouvrageChecked = '';
    }

    this.ouvrageChecked = list[index];
  }

  selectCheckBoxQuestion(targetType: any, index: number, list: any) {
    // If the checkbox was already checked, clear the currentlyChecked variable




      if (this.questionChecked === targetType ) {
        this.questionChecked = '';
        return;
      }

      this.questionChecked = list[index];

  }

  searchData(question: number) {
    let string: string;
    if (this.syndicat == 'Tous les syndicats') {
      string = 'tout' + 'tout' + this.ouvrage + 'q' + question;
    } else {
      string = this.syndicat! + this.commune + this.ouvrage + 'q' + question;
    }
    // this.store.dispatch(searchQuery({ query: string.toLowerCase() }));

    /* this.results$.pipe(results => {
        this.layerService.addLayerCouche(results[0].couche!);
    });*/

    this.searchService.searchCouches(string.toLowerCase().replace(' ', '')).subscribe(results => {
      if (results[0]) {

      this.layerService.addLayerCouche(results[0].couche!);
      } else {
        this._snackBar.open("Aucune données pour cette requete", "Annuler", {
          duration: 5000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center'
        });
      }
    });
  }
}

