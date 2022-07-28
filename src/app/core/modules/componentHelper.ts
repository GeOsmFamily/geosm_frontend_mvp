import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, EmbeddedViewRef, ApplicationRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentHelper {
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private appRef: ApplicationRef) {}
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
}
