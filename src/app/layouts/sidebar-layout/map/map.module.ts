import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { ConfigService } from 'src/app/core/services/geosm/config/config.service';

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [CommonModule, SharedModule],
  providers: [ThematiqueService, CarteService, ConfigService]
})
export class MapModule {}
