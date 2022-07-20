import { Component } from '@angular/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent {
  faLayer = faLayerGroup;
  constructor() {
    /* TODO document why this constructor is empty */
  }
}
