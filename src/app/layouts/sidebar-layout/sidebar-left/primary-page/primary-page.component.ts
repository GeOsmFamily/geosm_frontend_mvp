import { Component } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { PradecService } from 'src/app/core/services/geosm/pradec/pradec.service';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;
  constructor(public pradecService: PradecService) {
    /* TODO document why this constructor is empty */
  }

  loadData(nomsyndicat?: string, nomdepartement?: string, nomcommune?: string, typeouvrage?: string, typepointeau?: string) {
    this.pradecService.searchOuvrages(nomsyndicat,nomdepartement,nomcommune,typeouvrage,typepointeau).subscribe(pradec => {
      console.log(pradec);
    });
  }
}
