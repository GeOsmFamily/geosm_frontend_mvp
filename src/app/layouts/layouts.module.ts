import { TranslateModule } from '@ngx-translate/core';
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
import { LegendComponent } from './sidebar-layout/sidebar-right/legend/legend.component';
import { DownloadComponent } from './sidebar-layout/sidebar-right/download/download.component';
import { ActiveLayersComponent } from './sidebar-layout/sidebar-right/active-layers/component/active-layers.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MapToolsComponent } from './sidebar-layout/sidebar-right/map-tools/components/map-tools.component';
import { DrawComponent } from './sidebar-layout/sidebar-right/map-tools/components/draw/draw.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MeasureComponent } from './sidebar-layout/sidebar-right/map-tools/components/measure/measure.component';
import { PrintComponent } from './sidebar-layout/sidebar-right/map-tools/components/print/print.component';
import { RoutingComponent } from './sidebar-layout/sidebar-right/routing/component/routing.component';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    SidebarLayoutComponent,
    NavbarLayoutComponent,
    BaseLayoutComponent,
    PrimaryPageComponent,
    SecondaryPageComponent,
    SearchbarLayoutComponent,
    ActiveLayersComponent,
    MapToolsComponent,
    RoutingComponent,
    LegendComponent,
    DownloadComponent,
    DrawComponent,
    MeasureComponent,
    PrintComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MapModule,
    SharedModule,
    TranslateModule,
    FontAwesomeModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    ColorPickerModule
  ]
})
export class LayoutsModule {}
