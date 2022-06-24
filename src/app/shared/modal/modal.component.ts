import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faClose, faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { ModalData } from 'src/app/core/interfaces/modal-interface';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  faInfo = faInfoCircle;
  faClose = faClose;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData,
    private builder: FormBuilder
  ) {}

  public zoomToForm = this.builder.group({
    projection: ['WGS84', Validators.required],
    longitude: ['', Validators.required],
    latitude: ['', Validators.required]
  });

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close({
      statut: false
    });
  }

  valider() {
    console.log(this.zoomToForm.valid, this.zoomToForm);
    if (this.zoomToForm.valid) {
      this.dialogRef.close({
        statut: true,
        data: this.zoomToForm.value
      });
    }
  }
}
