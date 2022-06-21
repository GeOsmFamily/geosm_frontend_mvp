import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { ConfigService } from 'src/app/core/services/geosm/config/config.service';
import { MaterialModule } from 'src/app/core/modules/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [CommonModule, SharedModule, MaterialModule, FontAwesomeModule],
  providers: [ThematiqueService, CarteService, ConfigService]
})
export class MapModule {}
