import { Component, Input, OnInit } from '@angular/core';
import { DescriptiveSheet } from '../../map/interfaces/descriptiveSheet';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-fiche-ouvrage',
  templateUrl: './fiche-ouvrage.component.html',
  styleUrls: ['./fiche-ouvrage.component.scss']
})
export class FicheOuvrageComponent {
 /* @Input() on?: boolean;
  @Input() data?: DescriptiveSheet;*/
  data? : DescriptiveSheet
  text1 = '';
  constructor() {

  }

  closeFiche() {
    jQuery('app-fiche-ouvrage').css('display', 'none');
  }

  open(data: DescriptiveSheet) {
    this.data = data;
    this.text1 = this.data.properties.commentaire;
    console.log(this.data);
    jQuery('app-fiche-ouvrage').css('display', 'block');
  }
}
