import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [
    CommonModule,SharedModule
  ]
})
export class MapModule { }
