import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MetaDataInterface } from '../../../interfaces/metaDataInterface';

@Component({
  selector: 'app-metadata-modal',
  templateUrl: './metadata-modal.component.html',
  styleUrls: ['./metadata-modal.component.scss']
})
export class MetadataModalComponent implements OnInit {
  url_prefix: string | undefined;
  data_metadata: MetaDataInterface | undefined;

  constructor(public dialogRef: MatDialogRef<MetadataModalComponent>, @Inject(MAT_DIALOG_DATA) public data: MetaDataInterface) {}

  ngOnInit(): void {
    this.url_prefix = this.data['url_prefix'];

    this.data_metadata = this.data;
    console.log(this.data_metadata);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
