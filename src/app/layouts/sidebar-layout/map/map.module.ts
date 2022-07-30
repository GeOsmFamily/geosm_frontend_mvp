import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { ConfigService } from 'src/app/core/services/geosm/config/config.service';
import { MaterialModule } from 'src/app/core/modules/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtomSheetComponent } from './components/buttom-sheet/buttom-sheet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapComponent, ButtomSheetComponent],
  exports: [MapComponent],
  imports: [CommonModule, SharedModule, MaterialModule, FontAwesomeModule, TranslateModule, FormsModule, ReactiveFormsModule],
  providers: [ThematiqueService, CarteService, ConfigService]
})
export class MapModule {}
