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

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;

  data=[

    {
      "nomSyndicat":"Tous les syndicats",
      "nomDepartement":"Tous les départements",
      "Communes":[ {"nomCommune":"Toutes les communes"},

     ]

    },
    {
      "nomSyndicat":"SYNCOBE",
      "nomDepartement":"BENOUE",
      "Communes":[ {"nomCommune":"BIBEMI"},
      {"nomCommune":"LAGDO"},
      {"nomCommune":"GAROUA 2"},
      {"nomCommune":"GAROUA 1"},
      {"nomCommune":"TOUROUA"},
      {"nomCommune":"BARNDAKE"},
      {"nomCommune":"GAROUA 3"},
      {"nomCommune":"PITOA"},
      {"nomCommune":"NGONG"},
      {"nomCommune":"GASHIGA"},
      {"nomCommune":"BASHEO"},
      {"nomCommune":"DEMBO"},
     ]

    },
    {
      "nomSyndicat":"SYNCOMALOU",
      "nomDepartement":"MAYO-LOUTI",
      "Communes":[ {"nomCommune":"FIGUIL"},
      {"nomCommune":"GUIDER"},
      {"nomCommune":"MAYO OULO"},

     ]

    },
    {
      "nomSyndicat":"SYDECOMAR",
      "nomDepartement":"MAYO REY",
      "Communes":[ {"nomCommune":"MADINGRING"},
      {"nomCommune":"TOUBORO"},
      {"nomCommune":"TCHOLIRE"},
      {"nomCommune":"REY BOUBA"},

     ]

    }
  ]
  ouvrages=['Puit','Pompe','Forage','Latrines']

  questions=[
      "Ouvrages en bon état",
      "Ouvrages endommagés",
      "Ouvrages en bon état et non foctionnels",
      "Ouvrages en bon état et fonctionnels",
      "Ouvrages en bon état, fonctionnels mais eau de mauvaise qualité",
      "Ouvrages en bon état, non fonctionnels mais eau de bonne qualité",
      "Ouvrages ayant un comité de gestion fonctionel",
      "Ouvrages en bon état et non fonctionnels ayant un comité de gestion",
      "Ouvrages en bon état et non fonctionnels n'ayant aucun comité de gestion",
      "Ouvrages en bon état et fonctionnels n'ayant aucun comité de gestion",

  ]
  selectedIndex: number | undefined;
  selectedCommune: number | undefined;
  selectedOuvrage:number|undefined
  selectedSyndicat:number|undefined

  listDepartements= new Map<string,any>([])
  listComunes= new Map<string,any[]>([])

  showSyndicats=false
  showCommunes=false
  showOuvrages=false
  form:FormGroup
  forceSelected = false;

//sélection de l'utilisateur
  syndicat:string|undefined
  departement:string|undefined
  commune="Toutes les communes"
  ouvrage="Tous les ouvrages"

  //variables liées à ngModel, permettant de récupérer le choix de l'utilisateur
  nbdepartement:any
  nbCommune=["Toutes les communes"]
  nbOuvrage=["Tous les ouvrages"]
  listeSyndicats=["Tous les Syndicats"]

  list:string[]|undefined

  marker: any;
  clusters: any;
  constructor(public searchService:SearchService,public pradecService:PradecService) {
    for(let index=0;index<this.data.length;index++){
      let key=this.data[index].nomSyndicat
      let departement=this.data[index].nomDepartement
      let commune=[]


      for(let i=0;i<this.data[index].Communes.length;i++){
        commune.push(this.data[index].Communes[i].nomCommune)

      }
      this.listComunes.set(""+key,commune)

      this.listDepartements.set(""+key,departement)
    }

}




  getSyndicats():string[]{
    return Array.from(this.listDepartements.keys())
  }

  getDepartements():any[]{
      return this.listDepartements.get(this.syndicat!)
  }

  getCommunes():any[]|undefined{
    return this.listComunes.get(this.syndicat!)
  }

onGroupsChange(selectedPizzas: string[]) {

  if (selectedPizzas[0] == 'Tout') {
    this.syndicat = 'Tout';
    let mapHelper = new MapHelper();
    let searchResultLayer = mapHelper.getLayerByName('searchResultLayer')[0];
    searchResultLayer.getSource().clear();
  } else {
    this.syndicat = selectedPizzas[0];

    if (this.syndicat == 'SYNCOBE') {
      this.selectNominatim('benoue');
    } else if (this.syndicat == 'SYNCOMALOU') {
      this.selectNominatim('mayo-louti');
    } else if (this.syndicat == 'SYDECOMAR') {
      this.selectNominatim('mayo-rey');
    }
  }
  }

  selectNominatim(query:string) {
    this.searchService.searchNominatim(query).subscribe((results) => {
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


onDepartementChange(selectedPizzas: string[]) {
  if (selectedPizzas[0] == 'Tout') {
    this.departement = 'Tout';
  } else {
    this.departement = selectedPizzas[0];
  }

}
onCommuneChange(selectedPizzas: string[]) {

  if (selectedPizzas[0] == 'Tout') {
    this.commune = 'Tout';
  } else {
    this.commune = selectedPizzas[0];
  }

}

onOuvrageChange(selectedPizzas: string[]) {

  if (selectedPizzas[0] == 'Tout') {
    this.ouvrage = 'Tout';
  } else {
    this.ouvrage = selectedPizzas[0];
  }

}



changeSelection(event:any, index:any) {
  this.selectedIndex = event.target.checked ? index : undefined;
  console.log(this.questions[this.selectedIndex!])
  if (this.selectedIndex != undefined) {
  this.searchData(this.selectedIndex! + 1);
  }
}

  searchData(question: number) {
    this.pradecService.searchOuvrages(this.syndicat, this.commune, this.ouvrage, question).subscribe((pradec:PradecInterface) => {
        for (let index = 0; index < pradec.features.length; index++) {
          const element = pradec.features[index];
          if (element.properties.typeeau == "Puit") {
            element.properties.icon = "/assets/images/svg/puit.svg"
          }
          if (element.properties.typeeau == "Forage") {
            element.properties.icon = '/assets/images/svg/forage.svg';
          }
          if (element.properties.typeeau == 'Latrines') {
            element.properties.icon = '/assets/images/svg/latrines.svg';
          }
          if (element.properties.typeeau == 'Pompe') {
            element.properties.icon = '/assets/images/svg/pompe.svg';
          }
      }



       let responses = Array();

       pradec.features.forEach(element => {
         let geometry = {
           type: 'Point',
           coordinates: [element.geometry.coordinates[0], element.geometry.coordinates[1]]
         };

         responses.push({
           type: 'Feature',
           geometry: geometry,
           properties: element.properties
         });
       });

       let geojson = {
         type: 'FeatureCollection',
         features: responses
       };

       let point = Array();
       for (let index = 0; index < geojson.features.length; index++) {
         for (let j = 0; j < geojson.features[index].geometry.coordinates.length; j++) {
           //@ts-ignore
           let coord = transform(geojson.features[index].geometry.coordinates[j], 'EPSG:4326', 'EPSG:3857');

           this.marker = new Feature({
             geometry: new Point(coord),
             data: { i: index, j: j, type: 'point' }
           });

           point.push(this.marker);
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

       const clusterSource = new Cluster({
         distance: 80,
         source: vectorSource
       });

       const styleCache = {};
       this.clusters = new VectorLayer({
         source: clusterSource,
         //@ts-ignore
         nom: "pradec",
         type_layer: "pradec",
         style: function (feature) {
           const size = feature.get('features').length;
           if (size != 1) {
             //@ts-ignore
             let style = styleCache[size];
             if (!style) {
               style = new Style({
                 image: new CircleStyle({
                   radius: 15,
                   stroke: new Stroke({
                     color: '#fff'
                   }),
                   fill: new Fill({
                     color: '#009fe3'
                   })
                 }),
                 text: new Text({
                   text: size.toString(),
                   fill: new Fill({
                     color: '#fff'
                   })
                 })
               });
               //@ts-ignore
               styleCache[size] = style;
             }
             return style;
           } else {
             let styleDefaultII = new Style({
               image: new Icon({
                 scale: 0.02,
                 src: feature.get('features')[0].values_.icon
               })
             });

             return styleDefaultII;
           }
         }
       });

       let mapHelper = new MapHelper();

      let pradecLayer = mapHelper.getLayerByName('pradec');
      console.log(pradecLayer.length)
      if (pradecLayer.length > 0) {
        console.log("test")
           mapHelper.removeLayerToMap(this.clusters)
       }


       let maxZindex = mapHelper.getMaxZindexInMap();
       this.clusters.setZIndex(maxZindex + 1);
       mapHelper.addLayerToMap(this.clusters);



    });
  }

}
