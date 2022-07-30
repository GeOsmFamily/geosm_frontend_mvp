import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { containsExtent, intersects } from 'ol/extent';
import { boundingExtent, Transform } from 'src/app/core/modules/openlayers';

@Component({
  selector: 'app-buttom-sheet',
  templateUrl: './buttom-sheet.component.html',
  styleUrls: ['./buttom-sheet.component.scss']
})
export class ButtomSheetComponent implements OnInit {
  layer = Array();
  typeButton: any;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ButtomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private builder: FormBuilder
  ) {}

  public chooseLayer = this.builder.group({
    layer1: ['', Validators.required],
    layer2: ['', Validators.required]
  });

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    console.log(event);
  }

  ngOnInit(): void {
    this.typeButton = this.data['type'];
    this.layer = this.data['data'];
    console.log(this.layer);
  }

  compare() {
    let index1 = this.chooseLayer.value['layer1'];
    let index2 = this.chooseLayer.value['layer2'];

    let layer1 = this.data['data'][index1];
    let layer2 = this.data['data'][index2];

    if (layer1.bbox && layer2.bbox) {
      let bbox1 = layer1.bbox.split(',');

      let Amin1 = Transform([parseFloat(bbox1[0]), parseFloat(bbox1[1])], 'EPSG:4326', 'EPSG:3857');
      let Amax1 = Transform([parseFloat(bbox1[2]), parseFloat(bbox1[3])], 'EPSG:4326', 'EPSG:3857');

      let extentData1 = boundingExtent([Amin1, Amax1]);

      let bbox2 = layer1.bbox.split(',');

      let Amin2 = Transform([parseFloat(bbox2[0]), parseFloat(bbox2[1])], 'EPSG:4326', 'EPSG:3857');
      let Amax2 = Transform([parseFloat(bbox2[2]), parseFloat(bbox2[3])], 'EPSG:4326', 'EPSG:3857');

      let extentData2 = boundingExtent([Amin2, Amax2]);

      let bool = containsExtent(extentData1, extentData2);

      if (!bool) {
        intersects(extentData1, extentData2);
      }

      if (!bool) {
        alert('Impossible : les bbox des couches sont distants !');
      } else {
        this.bottomSheetRef.dismiss(this.chooseLayer.value);
      }
    } else if (layer1.zmax && layer2.zmax && layer1.zmin && layer2.zmin) {
      if (parseFloat(layer1.zmax) > parseFloat(layer2.zmax) && parseFloat(layer1.zmin) > parseFloat(layer2.zmin)) {
        alert('Impossible de comparer ces deux cartes: les echelles sont distantes !');
      } else if (parseFloat(layer1.zmax) < parseFloat(layer2.zmax) && parseFloat(layer1.zmin) < parseFloat(layer2.zmin)) {
        alert('Impossible de comparer ces deux cartes: les echelles sont distantes !');
      } else {
        this.bottomSheetRef.dismiss(this.chooseLayer.value);
      }
    } else {
      this.bottomSheetRef.dismiss(this.chooseLayer.value);
    }
  }
}
