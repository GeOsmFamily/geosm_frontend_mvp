import { Component } from '@angular/core';
import { Thematique } from 'src/app/core/interfaces/thematique-interface';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';

@Component({
  selector: 'app-secondary-page',
  templateUrl: './secondary-page.component.html',
  styleUrls: ['./secondary-page.component.scss']
})
export class SecondaryPageComponent {
  thematique: Thematique | undefined;

  activeGroup: { nom: string; img: string; color: string; } | undefined;
  constructor() {}

  setThematique(thematique: Thematique) {
    this.clearAllGroup();
    this.thematique = thematique;
    this.activeGroup = {
      nom: this.thematique.nom,
      img: environment.url_services + this.thematique.image_src,
      color: this.thematique.color
    };
  }

  clearAllGroup() {
    this.thematique = undefined;
    this.activeGroup = undefined;
  }

  //A revoir
  close() {
    this.clearAllGroup();
    $('app-secondary-page').css('left', '-370px');
  }

  //A revoir
  open() {
    console.log(40)
    $('app-secondary-page').css('left', '0px');
  }
}
