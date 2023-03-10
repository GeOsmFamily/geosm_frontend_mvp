import { Component, Input, OnInit } from '@angular/core';
import { Thematique } from 'src/app/core/interfaces/thematique-interface';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-thematiques',
  templateUrl: './thematiques.component.html',
  styleUrls: ['./thematiques.component.scss']
})
export class ThematiquesComponent implements OnInit {
  lenght: number | undefined;

  url_prefix: string = environment.url_services;

  @Input() thematique: Thematique | undefined;

  constructor(private thematiqueService: ThematiqueService) {}

  ngOnInit(): void {
    this.lenght = this.thematiqueService.getAllThematiques()!.length;
  }
}
