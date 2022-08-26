import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

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
  constructor( private formBuilder: FormBuilder,) {
    /* TODO document why this constructor is empty */
    for(let index=0;index<this.data.length;index++){
      var key=this.data[index].nomSyndicat
      var departement=this.data[index].nomDepartement
      var commune=[]


      for(let i=0;i<this.data[index].Communes.length;i++){
        commune.push(this.data[index].Communes[i].nomCommune)
    //    console.log(commune[i])
      }
      this.listComunes.set(""+key,commune)
  //    console.log(this.listComunes)
      this.listDepartements.set(""+key,departement)
    }
    //console.log("rrr"+this.syndicat)
    //this.listeSyndicats=Array.from(this.listDepartements.keys())
    //this.nbdepartement=Array.from(this.listComunes.keys())

//console.log("eeeeeee ="+ this.listComunes.keys())

      //this.onGroupsChange(this.listeSyndicats)
      this.form = this.formBuilder.group({

      });
}


getCdkConnectedOverlayPanelClasses(): string[] {


  return ['max-h-72', '-translate-y-8'];
}
toggleSyndicats(){
  this.showSyndicats=!this.showSyndicats
}

toggleCommunes(){
  this.showCommunes=!this.showCommunes
}

toggleOuvrages(){
  this.showOuvrages=!this.showOuvrages
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
  //console.log(selectedPizzas);


  if(selectedPizzas[0]=="Tout"){
    this.syndicat="Tous les syndicats"
  }
  else{
    this.syndicat=selectedPizzas[0]
  }
  //alert("rr = "+this.listDepartements.get(this.syndicat!))
  //console.log(this.listDepartements.get(this.syndicat!)+  "yyy")
  //console.log(this.syndicat)
}
onDepartementChange(selectedPizzas: string[]) {
  //console.log(selectedPizzas);
  if(selectedPizzas[0]=="Tout"){
    this.departement="Tous les départements"
  }
  else{
    this.departement=selectedPizzas[0]
  }

  //console.log(this.departement)
}
onCommuneChange(selectedPizzas: string[]) {
  //console.log(selectedPizzas);
  if(selectedPizzas[0]=="Tout"){
    this.commune="Toutes les communes"
  }
  else{
    this.commune=selectedPizzas[0]
  }

  //console.log(this.commune)
}

onOuvrageChange(selectedPizzas: string[]) {
  //console.log(selectedPizzas);
  if(selectedPizzas[0]=="Tout"){
    this.ouvrage="Tous les ouvrages"
  }
  else{
    this.ouvrage=selectedPizzas[0]
  }

  //console.log(this.ouvrage)
}



changeSelection(event:any, index:any) {
  this.selectedIndex = event.target.checked ? index : undefined;
  console.log(this.questions[this.selectedIndex!])
  // do your logic here...
}
changeSyndicat(event:any, index:any) {

  this.selectedSyndicat = event.target.checked ? index : undefined;
  this.syndicat=this.getSyndicats()[this.selectedSyndicat!]
  console.log(event.target.check)
}

changeCommune(event:any, index:any) {
  this.selectedCommune = event.target.checked ? index : undefined;
  this.commune=this.getCommunes()![this.selectedCommune!]

}

changeOuvrage(event:any, index:any) {
  this.selectedOuvrage = event.target.checked ? index : undefined;
  this.ouvrage=this.ouvrages  [this.selectedOuvrage!]

}

}
