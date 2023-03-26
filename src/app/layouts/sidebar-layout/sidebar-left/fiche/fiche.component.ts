import { Component, OnInit } from '@angular/core';
import { DescriptiveSheet } from '../../map/interfaces/descriptiveSheet';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-fiche',
  templateUrl: './fiche.component.html',
  styleUrls: ['./fiche.component.scss']
})
export class FicheComponent  {

  data? : DescriptiveSheet

  constructor() { }



  closeFiche() {
    jQuery('app-fiche').css('left', '-370px');
  }

  open(data: DescriptiveSheet) {
    this.data = data;
    //this.text1 = this.data.properties.commentaire;
    console.log(this.data.properties);
    jQuery('app-fiche').css('left', '370px');
  }

}
