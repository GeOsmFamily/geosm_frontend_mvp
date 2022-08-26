import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fiche-ouvrage',
  templateUrl: './fiche-ouvrage.component.html',
  styleUrls: ['./fiche-ouvrage.component.scss']
})
export class FicheOuvrageComponent  {

  @Input() on?:boolean
  text1=""
  constructor() {
    this.text1="Créé en 1996, la Fondation Joseph The Worker / Structure Lazarienne est Association loi 1901, ONG de jeunesse et de financement, Institution à caractère social siégeant à Porto-Novo et ayant des Antennes dans presque tous les départements du Bénin. Le volet environnement et protection de la nature a pour objectif global de contribuer à l’amélioration du niveau de vie des couches défavorisées en mettant un accent particulier sur la protection de l’environnement par la diminution des émissions des gaz à effet de serre, la vulgarisation et la consommation de l’énergie solaire et le bio gaz (sources de promotion économique, sociale et culturelle des couches vulnérables et surtout des femmes et des enfants). Nous avons mis en œuvre des projets dans le domaine dont celui de la valorisation des Boues de Vidanges dans l’agriculture, celui de la promotion des"
  }

  closeFiche(){
    alert("hi")
    this.on=false
  }

}
