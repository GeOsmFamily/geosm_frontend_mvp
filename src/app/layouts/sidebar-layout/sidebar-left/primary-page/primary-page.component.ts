import { Component, OnInit } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Thematique } from 'src/app/core/interfaces/thematique-interface';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent implements OnInit {
  faLayer = faLayerGroup;
  thematiques: Thematique[] | undefined;
  constructor(public thematiqueService: ThematiqueService,public componentHelper:ComponentHelper) {
    /* TODO document why this constructor is empty */
  }
  ngOnInit(): void {
    this.thematiqueService.getThematiques().subscribe((result) => {
      this.thematiques = result.data.thematiques
    })
  }

  openThematiqueSlide(thematique: Thematique) {
    console.log(10)
    this.componentHelper.openGroupThematiqueSlide(thematique);
  }
}
