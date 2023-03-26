import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LayersService } from 'src/app/core/services/geosm/layers.service';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-couche',
  templateUrl: './couche.component.html',
  styleUrls: ['./couche.component.scss']
})
export class CoucheComponent implements OnInit {
  @Input() couche: Couche | undefined;

  @Output() toogle_couche = new EventEmitter();

  url_prefix = environment.url_services;

  constructor(public layersService: LayersService) { }

  ngOnInit(): void {
  }

  disabled_couche(couche: Couche): boolean {
    if (couche['wms_type'] == 'osm' && (couche['number_features'] == 0 || couche['number_features'] == null)) {
      return true;
    } else {
      return false;
    }
  }

  toogleLayer(couche: Couche) {
    if (couche.check) {
      this.layersService.addLayerCouche(couche);
    } else {
      this.layersService.removeLayerCouche(couche);
    }
  }
}
