import { TranslateService } from '@ngx-translate/core';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShareService } from 'src/app/core/services/geosm/share.service';
import { environment } from 'src/environments/environment';
import { CaracteristicSheet } from 'src/app/core/interfaces/caracteristicSheet';
import { MapHelper } from '../../helpers/maphelper';
import { Point } from 'ol/geom';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-caracteristique-lieu-modal',
  templateUrl: './caracteristique-lieu-modal.component.html',
  styleUrls: ['./caracteristique-lieu-modal.component.scss']
})
export class CaracteristiqueLieuModalComponent {
  environment: any;
  faTimes = faTimes;
  constructor(
    public dialogRef: MatDialogRef<CaracteristiqueLieuModalComponent>,
    @Inject(MAT_DIALOG_DATA) public caracteristiquesModel: CaracteristicSheet,
    public translate: TranslateService,
    public shareService: ShareService,
    public componentHelper: ComponentHelper
  ) {
    translate.addLangs(['fr']);
    translate.setDefaultLang('fr');
    this.environment = environment;
  }

  setSescriptiveModel(data: CaracteristicSheet) {
    this.caracteristiquesModel = data;
  }

  zoomToPoint() {
    if (this.caracteristiquesModel.geometry) {
      let mapHelper = new MapHelper();
      mapHelper.fit_view(new Point(this.caracteristiquesModel.geometry), 16);
    }
  }
  close_caracteristique() {
    this.dialogRef.close();
  }

  shareLocation() {
    let coord = this.caracteristiquesModel.geometry;
    let path = coord[0].toFixed(4) + ',' + coord[1].toFixed(4) + ',' + this.caracteristiquesModel.map.getView().getZoom();
    let url_share = this.environment.url_frontend + '?share=location&path=' + path;

    this.componentHelper.openSocialShare(url_share, 5);
  }
}
