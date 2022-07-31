import { DownloadDataModelInterface } from './../../interfaces/download';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { faDownload, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-download-layers',
  templateUrl: './list-download-layers.component.html',
  styleUrls: ['./list-download-layers.component.scss']
})
export class ListDownloadLayersComponent implements OnInit {
  environment = environment;
  faDownload = faDownload;
  faTimesCircle = faTimesCircle;
  constructor(
    @Inject(MAT_DIALOG_DATA) public listLayers: DownloadDataModelInterface[],
    public dialogRef: MatDialogRef<ListDownloadLayersComponent>,
    public thematiqueService: ThematiqueService,
    public sanitzer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.formatLayers();
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  formatLayers() {
    for (let index = 0; index < this.listLayers.length; index++) {
      this.listLayers[index].layer = this.thematiqueService.getCoucheFromId(this.listLayers[index].id)!;
      this.listLayers[index].groupThematique = this.thematiqueService.getThematiqueFromIdCouche(this.listLayers[index].id)!;
    }
    console.log(this.listLayers);
  }
}
