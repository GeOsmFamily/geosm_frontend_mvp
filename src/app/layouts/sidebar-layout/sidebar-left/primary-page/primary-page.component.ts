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

  listDepartements= new Map<string,any>([])
  listComunes= new Map<string,any[]>([])
  syndicat:any|undefined
listeSyndicats:any
  departement:string|undefined
  nbdepartement:any
  list:string[]|undefined
  constructor() {
    /* TODO document why this constructor is empty */
    for(let index=0;index<this.data.length;index++){
      var key=this.data[index].nomSyndicat
      var departement=this.data[index].nomDepartement
      var commune=[]


      for(let i=0;i<this.data[index].Communes.length;i++){
        commune.push({'nom':this.data[index].Communes[i]})
      }
      this.listComunes.set(""+key,commune)
      this.listDepartements.set(""+key,departement)
    }
    console.log("rrr"+this.syndicat)
    this.listeSyndicats=Array.from(this.listDepartements.keys())
    this.nbdepartement=Array.from(this.listComunes.keys())
console.log("eeeeeee ="+ this.listDepartements.keys())
  }


  ngOnInit(){
console.log()
    }

  getSyndicats():string[]{
    return Array.from(this.listDepartements.keys())
  }

  getDepartements():any[]{
      return this.listDepartements.get(this.syndicat!)
  }

  getCommunes():any[]|undefined{
    return this.listComunes.get(this.departement!)
  }
alerat(){
  alert(this.syndicat)
}
onGroupsChange(selectedPizzas: string[]) {
  console.log(selectedPizzas);
  this.syndicat=selectedPizzas[0]
  this.list?.push(this.listDepartements.get(this.syndicat!))
  alert("rr = "+this.listDepartements.get(this.syndicat!))
  console.log(this.listDepartements.get(this.syndicat!)+  "yyy")
}
onDepartementChange(selectedPizzas: string[]) {
  console.log(selectedPizzas);

  this.departement=selectedPizzas[0]
}
}
