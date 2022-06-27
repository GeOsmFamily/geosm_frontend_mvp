import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { SidebarLayoutComponent } from './sidebar-layout/sidebar-layout.component';
import { NavbarLayoutComponent } from './navbar-layout/navbar-layout.component';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../core/modules/material';
import { PrimaryPageComponent } from './sidebar-layout/sidebar-left/primary-page/primary-page.component';
import { SecondaryPageComponent } from './sidebar-layout/sidebar-left/secondary-page/secondary-page.component';
import { MapModule } from './sidebar-layout/map/map.module';
import { SearchbarLayoutComponent } from './navbar-layout/searchbar-layout/searchbar-layout.component';
import { SharedModule } from '../shared/shared.module';
import { ActiveLayersComponent } from './sidebar-layout/sidebar-right/active-layers/active-layers.component';
import { MapToolsComponent } from './sidebar-layout/sidebar-right/map-tools/map-tools.component';
import { RoutingComponent } from './sidebar-layout/sidebar-right/routing/routing.component';
import { LegendComponent } from './sidebar-layout/sidebar-right/legend/legend.component';
import { DownloadComponent } from './sidebar-layout/sidebar-right/download/download.component';



@NgModule({
  declarations: [AuthLayoutComponent,SidebarLayoutComponent,NavbarLayoutComponent,BaseLayoutComponent, PrimaryPageComponent, SecondaryPageComponent,SearchbarLayoutComponent, ActiveLayersComponent, MapToolsComponent, RoutingComponent, LegendComponent, DownloadComponent],
  imports: [
    CommonModule,RouterModule,MaterialModule,MapModule,SharedModule
  ]
})
export class LayoutsModule { }
