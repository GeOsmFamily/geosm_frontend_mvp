import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { Carte } from '../../interfaces/carte-interface';
import { CarteService } from './carte/carte.service';
import { environment } from 'src/environments/environment';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';
import { ThematiqueService } from './thematique/thematique.service';

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  constructor(
    public carteService: CarteService,
    public thematiqueService: ThematiqueService,
    public snackbar: MatSnackBar,
    public translate: TranslateService
  ) {}

  addLayerCarte(carte: Carte) {
    let groupCarte = this.carteService.getGroupeCarteByCarteId(carte.id);

    let mapHelper = new MapHelper();
    let type: 'wfs' | 'wms' | 'xyz';
    if (carte.type == 'wms') {
      type = 'wms';
    } else if (carte.type == 'xyz') {
      type = 'xyz';
    }
    if (mapHelper.getLayerByName(carte.nom).length > 0) {
      this.translate.get('layers').subscribe((res: any) => {
        this.snackbar.open(res.already_added, res.cancel, {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center'
        });
      });
    } else {
      let layer = mapHelper.constructLayer({
        nom: carte.nom,
        type: type!,
        type_layer: 'geosmCatalogue',
        url: carte.url,
        visible: true,
        inToc: true,
        properties: {
          group_id: groupCarte?.id,
          couche_id: carte.id,
          type: 'carte'
        },
        iconImagette: environment.url_services + carte.image_url,
        descriptionSheetCapabilities: undefined!
      });

      mapHelper.addLayerToMap(layer!);
      carte.check = true;
    }
  }

  removeLayerCarte(carte: Carte) {
    let groupCarte = this.carteService.getGroupeCarteByCarteId(carte.id);

    let mapHelper = new MapHelper();

    let layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: groupCarte?.id!,
      couche_id: carte.id,
      type: 'carte'
    });

    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
      carte.check = false;
    }
  }

  addLayerCouche(couche: Couche) {
    let mapHelper = new MapHelper();
    let groupThematique = this.thematiqueService.getThematiqueFromIdCouche(couche.id);
    if (mapHelper.getLayerByName(couche.nom).length > 0) {
      this.translate.get('layers').subscribe((res: any) => {
        this.snackbar.open(res.already_added, res.cancel, {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center'
        });
      });
    } else {
      this.geDimensionsOfImage(environment.url_services + couche.logo, (dimension: { width: number; height: number }) => {
        let size = 0.4;

        if (dimension) {
          size = 40 / dimension.width;
        }

        let pathImg = couche.logo;
        console.log(couche);
        let layer = mapHelper.constructLayer({
          nom: couche.nom,
          type: couche.service_carto == 'wms' ? 'wms' : 'wfs',
          identifiant: couche.identifiant,
          type_layer: 'geosmCatalogue',
          url: couche.qgis_url,
          visible: true,
          inToc: true,
          properties: {
            group_id: groupThematique!.id,
            couche_id: couche.id,
            type: 'couche'
          },
          iconImagette: environment.url_services + pathImg,
          icon: environment.url_services + couche.logo,
          cluster: true,
          size: size,
          legendCapabilities: {
            useCartoServer: true
          },
          descriptionSheetCapabilities: couche.wms_type
        });
        mapHelper.addLayerToMap(layer!);
        couche.check = true;
      });
    }
  }

  geDimensionsOfImage(urlImage: string, callBack: (dimenions: { width: number; height: number }) => void) {
    try {
      let img = new Image();
      img.onload = function () {
        callBack({ width: img.width, height: img.height });
      };
      img.src = urlImage;
    } catch (error) {
      callBack(null!);
    }
  }

  removeLayerCouche(couche: Couche) {
    let groupThematique = this.thematiqueService.getThematiqueFromIdCouche(couche.id);

    let mapHelper = new MapHelper();

    let layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: groupThematique!.id,
      couche_id: couche.id,
      type: 'couche'
    });
    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
      couche.check = false;
    }
  }
}
