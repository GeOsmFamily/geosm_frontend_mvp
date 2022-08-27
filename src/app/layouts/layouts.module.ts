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
import { SharedModule } from '../shared/shared.module';
import { LegendComponent } from './sidebar-layout/sidebar-right/legend/legend.component';
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
import { CommentComponent } from './sidebar-layout/sidebar-right/map-tools/components/comment/comment.component';
import { ListDownloadLayersComponent } from './sidebar-layout/sidebar-right/download/components/list-download-layers/list-download-layers.component';
import { ChartOverlayComponent } from './sidebar-layout/sidebar-right/download/components/chart-overlay/chart-overlay.component';
import { DownloadComponent } from './sidebar-layout/sidebar-right/download/components/download/download.component';
import { SearchbarLayoutComponent } from './navbar-layout/searchbar-layout/component/searchbar-layout.component';
import { MetadataModalComponent } from './sidebar-layout/sidebar-right/active-layers/component/metadata-modal/metadata-modal.component';
import { SectionComponent } from './sidebar-layout/sidebar-left/section/section.component';
import { FicheOuvrageComponent } from './sidebar-layout/sidebar-left/fiche-ouvrage/fiche-ouvrage.component';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    SidebarLayoutComponent,
    NavbarLayoutComponent,
    BaseLayoutComponent,
    PrimaryPageComponent,
    SecondaryPageComponent,
    ActiveLayersComponent,
    MapToolsComponent,
    RoutingComponent,
    LegendComponent,
    DrawComponent,
    MeasureComponent,
    PrintComponent,
    CommentComponent,
    ListDownloadLayersComponent,
    ChartOverlayComponent,
    SearchbarLayoutComponent,
    DownloadComponent,
    MetadataModalComponent,
    SectionComponent,
    FicheOuvrageComponent
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
    ColorPickerModule
  ]
})
export class LayoutsModule {}
