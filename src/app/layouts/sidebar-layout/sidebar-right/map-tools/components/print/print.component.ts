import { Extent } from 'ol/extent';
import { Map } from 'src/app/core/modules/openlayers';
import { Component, Input } from '@angular/core';
import { transform } from 'ol/proj';
import { PrintTool } from '../../tools/print';
import html2canvas from 'html2canvas';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent {
  @Input() map: Map | undefined;
  titre = '';
  description = '';
  image: any;
  layer: any;
  isLoading = false;

  printMap() {
    this.isLoading = true;

    let exportOptions = {
      height: 0,
      width: 0,
      filter: function (element: any) {
        let className = element.className || '';
        return (
          className.indexOf('ol-control') === -1 ||
          className.indexOf('ol-scale') > -1 ||
          (className.indexOf('ol-attribution') > -1 && className.indexOf('ol-uncollapsible'))
        );
      }
    };

    let width = this.map?.getSize()![0];
    let height = this.map?.getSize()![1];

    this.map?.once('rendercomplete', () => {
      exportOptions.width = width!;
      exportOptions.height = height!;
      html2canvas(this.map?.getViewport()!, exportOptions).then(canvas => {
        this.printModule(canvas.toDataURL('image/jpeg'));
      });
    });

    this.map?.render();
  }

  printModule(url: string) {
    function getCenterOfExtent(ext: Extent) {
      let X = ext[0] + (ext[2] - ext[0]) / 2;
      let Y = ext[1] + (ext[3] - ext[1]) / 2;
      return [X, Y];
    }

    function getmetricscal() {
      let px = jQuery('.ol-scale-line-inner').css('width');

      let numpx = px.replace(/\D+/g, '');
      let num = Number(numpx);
      let distancecarte = num * 0.264583 * 0.1;

      let scale = jQuery('.ol-scale-line-inner').text();
      let numscale = scale.replace(/\D+/g, '');
      let numscaleint = Number(numscale);

      let unit = scale.replace(/[0-9]/g, '');

      if (unit == ' km') {
        numscaleint = numscaleint * 100000;
      } else if (unit == ' m') {
        numscaleint = numscaleint * 100;
      }

      let dem = numscaleint / distancecarte;

      return dem;
    }

    let extents = this.map?.getView().calculateExtent(this.map.getSize());
    let center = getCenterOfExtent(extents!);
    let WGS84 = transform([center[0], center[1]], 'EPSG:3857', 'EPSG:4326');
    let format = 'JPEG';

    let images = {
      png0: url,

      png1: 'iVBORw0KGgoAAAANSUhEUgAAAzMAAAHMCAIAAABukmEEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAguSURBVHhe7dYxAQAADMOg+Tfd2cgBKrgBANBgZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAAFWYGAFBhZgAADdsDLQyux3VMIggAAAAASUVORK5CYII='   };

    this.titre = '';
    this.description = '';
    this.isLoading = false;

    let printTool = new PrintTool();
    printTool.createPDFObject(images, format, 'none', WGS84, getmetricscal(), this.titre, this.description);
  }
}
