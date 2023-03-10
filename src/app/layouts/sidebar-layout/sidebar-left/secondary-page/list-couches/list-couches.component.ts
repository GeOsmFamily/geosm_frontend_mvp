import { Component, Input, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Thematique } from 'src/app/core/interfaces/thematique-interface';
import { LayersService } from 'src/app/core/services/geosm/layers.service';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';

@Component({
  selector: 'app-list-couches',
  templateUrl: './list-couches.component.html',
  styleUrls: ['./list-couches.component.scss']
})
export class ListCouchesComponent implements OnInit {
  @Input() thematique: Thematique | undefined;

  constructor(
    public layerService: LayersService,
  ) {}

  ngOnInit(): void {
  }

  coucheSelected(event: MatSelectionListChange) {
    let couche: Couche = event.option.value;
    couche.check = event.option.selected;
    this.toogleLayer(couche);
   
  }

  toogleLayer(couche: Couche) {
    if (couche.check) {
      this.layerService.addLayerCouche(couche);
    } else {
      this.layerService.removeLayerCouche(couche);
    }
  }
}
