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
import { Observable } from 'rxjs';
import { SearchInterface } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/search';
import { selectSearch } from 'src/app/layouts/navbar-layout/searchbar-layout/states/search.selector';
import { searchQuery } from 'src/app/layouts/navbar-layout/searchbar-layout/states/search.actions';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;

  data = [
    {
      nomSyndicat: 'Tous les syndicats',
      nomDepartement: 'Tous les départements',
      Communes: [{ nomCommune: 'Toutes les communes' }]
    },
    {
      nomSyndicat: 'SYNCOBE',
      nomDepartement: 'BENOUE',
      Communes: [
        { nomCommune: 'BIBEMI' },
        { nomCommune: 'LAGDO' },
        { nomCommune: 'GAROUA 2' },
        { nomCommune: 'GAROUA 1' },
        { nomCommune: 'TOUROUA' },
        { nomCommune: 'BARNDAKE' },
        { nomCommune: 'GAROUA 3' },
        { nomCommune: 'PITOA' },
        { nomCommune: 'NGONG' },
        { nomCommune: 'GASHIGA' },
        { nomCommune: 'BASHEO' },
        { nomCommune: 'DEMBO' }
      ]
    },
    {
      nomSyndicat: 'SYNCOMALOU',
      nomDepartement: 'MAYO-LOUTI',
      Communes: [{ nomCommune: 'FIGUIL' }, { nomCommune: 'GUIDER' }, { nomCommune: 'MAYO OULO' }]
    },
    {
      nomSyndicat: 'SYDECOMAR',
      nomDepartement: 'MAYO REY',
      Communes: [{ nomCommune: 'MADINGRING' }, { nomCommune: 'TOUBORO' }, { nomCommune: 'TCHOLIRE' }, { nomCommune: 'REY BOUBA' }]
    }
  ];
  ouvrages = ['Puits', 'Pompes', 'Forages', 'Latrines'];

  questions = [
    'Ouvrages en bon état',
    'Ouvrages endommagés',
    'Ouvrages en bon état et non foctionnels',
    'Ouvrages en bon état et fonctionnels',
    'Ouvrages en bon état, fonctionnels mais eau de mauvaise qualité',
    'Ouvrages en bon état, non fonctionnels mais eau de bonne qualité',
    'Ouvrages ayant un comité de gestion fonctionel',
    'Ouvrages en bon état et non fonctionnels ayant un comité de gestion',
    "Ouvrages en bon état et non fonctionnels n'ayant aucun comité de gestion",
    "Ouvrages en bon état et fonctionnels n'ayant aucun comité de gestion"
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
  commune = 'Toutes les communes';
  ouvrage: string | undefined;
  auxi: string | undefined;

  //variables liées à ngModel, permettant de récupérer le choix de l'utilisateur
  nbdepartement: any;
  nbCommune = ['Toutes les communes'];
  // nbOuvrage=["Tous les ouvrages"]
  listeSyndicats = ['Tous les Syndicats'];

  list: string[] | undefined;
  results$: Observable<SearchInterface[]>;
  constructor(
    private store: Store<SearchState>,
    private formBuilder: FormBuilder,
    public searchService: SearchService,
    public pradecService: PradecService,
    public layerService: LayersService
  ) {
    this.results$ = this.store.pipe(select(selectSearch));
    for (let index = 0; index < this.data.length; index++) {
      let key = this.data[index].nomSyndicat;
      let departement = this.data[index].nomDepartement;
      let commune = [];

      for (let i = 0; i < this.data[index].Communes.length; i++) {
        commune.push(this.data[index].Communes[i].nomCommune);
        //    console.log(commune[i])
      }
      this.listComunes.set('' + key, commune);
      //    console.log(this.listComunes)
      this.listDepartements.set('' + key, departement);
    }
    //console.log("rrr"+this.syndicat)
    //this.listeSyndicats=Array.from(this.listDepartements.keys())
    //this.nbdepartement=Array.from(this.listComunes.keys())

    //console.log("eeeeeee ="+ this.listComunes.keys())

    //this.onGroupsChange(this.listeSyndicats)
    this.form = this.formBuilder.group({});
  }

  getCdkConnectedOverlayPanelClasses(): string[] {
    return ['max-h-72', '-translate-y-8'];
  }
  toggleSyndicats() {
    this.showSyndicats = !this.showSyndicats;
  }

  toggleCommunes() {
    this.showCommunes = !this.showCommunes;
  }

  toggleOuvrages() {
    this.showOuvrages = !this.showOuvrages;
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
    this.selectedIndex = event.target.checked ? index : undefined;
    console.log(this.questions[this.selectedIndex!]);
    this.searchData(this.selectedIndex! + 1);
  }
  changeSyndicat(event: any, index: any) {
    this.selectedSyndicat = event.target.checked ? index : undefined;
    this.syndicat = this.getSyndicats()[this.selectedSyndicat!];
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
    console.log(this.syndicat);
  }

  changeCommune(event: any, index: any) {
    this.selectedCommune = event.target.checked ? index : undefined;
    this.commune = this.getCommunes()![this.selectedCommune!];

  }

  changeOuvrage(event: any, index: any) {
    this.selectedOuvrage = event.target.checked ? index : undefined;

    if (this.ouvrages[this.selectedOuvrage!] == 'Puits') {
      this.ouvrage = 'Puit';
    } else if (this.ouvrages[this.selectedOuvrage!] == 'Forages') {
      this.ouvrage = 'Forage';
    } else if (this.ouvrages[this.selectedOuvrage!] == 'Pompes') {
      this.ouvrage = 'Pompe';
    } else {
      this.ouvrage = 'Latrines';
    }

    this.auxi = this.ouvrages[this.selectedOuvrage!];
    console.log(this.ouvrage);
  }

  selectCheckBoxSyndicat(targetType: any, index: number, list: any) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.syndicatChecked === targetType) {
      this.syndicatChecked = '';
      return;
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
    if (this.questionChecked === targetType) {
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

       string = this.syndicat + this.commune + this.ouvrage + 'q' + question;

    }
   // this.store.dispatch(searchQuery({ query: string.toLowerCase() }));

   /* this.results$.pipe(results => {
        this.layerService.addLayerCouche(results[0].couche!);
    });*/

    this.searchService.searchCouches(string.toLowerCase()).subscribe(results => {
      this.layerService.addLayerCouche(results[0].couche!);
    });

  }
}

