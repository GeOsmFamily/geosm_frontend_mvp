import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, EmbeddedViewRef, ApplicationRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialsharedComponent } from 'src/app/shared/socialshared/socialshared.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentHelper {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private _snackBar: MatSnackBar
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
}
