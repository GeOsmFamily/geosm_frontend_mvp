import { Map } from 'src/app/core/modules/openlayers';
import { Component, Input } from '@angular/core';
import { faComment, faDrawPolygon, faPrint, faRulerHorizontal } from '@fortawesome/free-solid-svg-icons';
import { MapTools } from '../interfaces/tools';

@Component({
  selector: 'app-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent {
  @Input() map: Map | undefined;

  mapTools: MapTools[] = [
    {
      title: 'Draw',
      type: 'draw',
      icon: faDrawPolygon,
      expanded: true
    },
    {
      title: 'Measure',
      type: 'measure',
      icon: faRulerHorizontal,
      expanded: false
    },
    {
      title: 'Comments',
      type: 'comments',
      icon: faComment,
      expanded: false
    },
    {
      title: 'Print',
      type: 'print',
      icon: faPrint,
      expanded: false
    }
  ];

  constructor() {
    /* TODO document why this constructor is empty */
  }

  expansionClose(tool: MapTools) {}
}
