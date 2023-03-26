import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, EmbeddedViewRef, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DescriptiveSheetModalComponent } from 'src/app/layouts/sidebar-layout/map/components/descriptive-sheet-modal/descriptive-sheet-modal.component';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { DescriptiveSheet } from 'src/app/layouts/sidebar-layout/map/interfaces/descriptiveSheet';
import { LayersInMap } from 'src/app/layouts/sidebar-layout/map/interfaces/layerinmap';
import { SocialsharedComponent } from 'src/app/shared/socialshared/socialshared.component';
import { CaracteristicSheet } from '../interfaces/caracteristicSheet';
import { LayerGroup } from './openlayers';
import { Thematique } from '../interfaces/thematique-interface';
import { SecondaryPageComponent } from 'src/app/layouts/sidebar-layout/sidebar-left/secondary-page/secondary-page.component';
import { FicheComponent } from 'src/app/layouts/sidebar-layout/sidebar-left/fiche/fiche.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentHelper {
  ficheComponent: FicheComponent | undefined;
  secondaryPage: SecondaryPageComponent | undefined;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  createComponent(component: any, componentProps?: object) {
    // 1. Create a component reference from the component
    const componentRef = this.componentFactoryResolver.resolveComponentFactory(component).create(this.injector);

    if (componentProps && typeof componentRef.instance === 'object') {
      Object.assign(componentRef.instance as object, componentProps);
    }
    return componentRef;
  }

  appendComponent(componentRef: ComponentRef<unknown>, appendTo: Element) {
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    appendTo.appendChild(domElem);

    return;
  }

  openSocialShare(url: string, durationInSeconds: number = 5) {
    this._snackBar.openFromComponent(SocialsharedComponent, {
      duration: durationInSeconds * 1000,
      data: { url: url }
    });
  }

  openDescriptiveSheet(type: string, layer: LayersInMap, coordinates_3857: [number, number], geometry?: any, properties?: any) {
    if (type) {
      if (layer.layer instanceof LayerGroup) {
        layer.layer = new MapHelper().getLayerQuerryInLayerGroup(layer.layer);
      }
      this.openDescriptiveSheetModal(
        {
          type: type,
          layer: layer,
          properties: properties,
          geometry: geometry,
          coordinates_3857: coordinates_3857
        },
        [],
        () => {
          // function
        }
      );
    }
  }

  openDescriptiveSheetModal(data: DescriptiveSheet, size: Array<string> | [], callBack: Function) {
    let position = {
      top: '100px',
      left: window.innerWidth < 500 ? '0px' : window.innerWidth / 2 - 400 / 2 + 'px'
    };
    for (let index = 0; index < this.dialog.openDialogs.length; index++) {
      const elementDialog = this.dialog.openDialogs[index];

      if (elementDialog.componentInstance instanceof DescriptiveSheetModalComponent) {
        if (document.getElementById(elementDialog.id)) {
          if (document.getElementById(elementDialog.id)!.parentElement) {
            position.top = document.getElementById(elementDialog.id)!.parentElement!.getBoundingClientRect().top + 'px';
            position.left = document.getElementById(elementDialog.id)!.parentElement!.getBoundingClientRect().left + 'px';
          }
        }

        elementDialog.close();
      }
    }

    let proprietes: MatDialogConfig = {
      disableClose: false,
      minWidth: 650,
      maxHeight: 460,
      width: '550px',
      data: data,
      hasBackdrop: false,
      autoFocus: false,
      position: position
    };

    if (size.length > 0) {
      // proprietes['width']=size[0]
      proprietes['height'] = size[1];
    }
    const modal = this.dialog.open(DescriptiveSheetModalComponent, proprietes);

    modal.afterClosed().subscribe(async (result: any) => {
      callBack(result);
    });
    console.log(data);

    //this.ficheComponent?.open(data);
  }


  openCaracteristic(data: CaracteristicSheet) {
    let position = {
      top: '60px',
      left: window.innerWidth < 500 ? '0px' : window.innerWidth / 2 - 400 / 2 + 'px'
    };
    for (let index = 0; index < this.dialog.openDialogs.length; index++) {
      const elementDialog = this.dialog.openDialogs[index];

      if (elementDialog.componentInstance instanceof DescriptiveSheetModalComponent) {
        if (document.getElementById(elementDialog.id)) {
          if (document.getElementById(elementDialog.id)?.parentElement) {
            position.top = document.getElementById(elementDialog.id)?.parentElement?.getBoundingClientRect().top + 'px';
            position.left = document.getElementById(elementDialog.id)?.parentElement?.getBoundingClientRect().left + 'px';
          }
        }

        elementDialog.close();
      }
    }

    let proprietes: MatDialogConfig = {
      disableClose: false,
      minWidth: 450,
      maxHeight: 460,
      width: '400px',
      data: data,
      hasBackdrop: false,
      autoFocus: false,
      position: position
    };

    //  this.dialog.open(CaracteristiquesLieuModalComponent, proprietes);
  }

  openGroupThematiqueSlide(thematique: Thematique) {

    this.secondaryPage?.setThematique(thematique);
     console.log(20);
    this.secondaryPage?.open();
    console.log(30)

  }

  setComponent(component: string, comp: any) {
    if (component == 'SecondaryPageComponent') {
      this.secondaryPage = comp;
    }
    if(component == 'FicheComponent')
    {
      this.ficheComponent =comp;
    }
  }
}
