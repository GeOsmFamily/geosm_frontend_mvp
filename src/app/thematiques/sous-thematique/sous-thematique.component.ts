import { SousThematique, Thematique } from 'src/app/core/interfaces/thematique-interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sous-thematique',
  templateUrl: './sous-thematique.component.html',
  styleUrls: ['./sous-thematique.component.scss']
})
export class SousThematiqueComponent  {

  @Input() thematique:Thematique|undefined
  @Input() sousThematique:SousThematique|undefined
  closeThematique=true
  openThematique=false

  constructor() { }



  showHideCoucheSousThematique(){


    if(this.sousThematique?.open && this.closeThematique){

      this.closeThematique=false
      //alert(this.closeThematique)
    }else
        this.closeThematique=true


      if(!this.sousThematique?.open && !this.openThematique){

        this.openThematique=true
      }else
          this.openThematique=false
        }
}
