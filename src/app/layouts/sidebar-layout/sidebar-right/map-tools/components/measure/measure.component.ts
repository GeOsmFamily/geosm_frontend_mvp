import { TranslateService } from '@ngx-translate/core';
import { CircleStyle, Draw, Fill, Map, Overlay, Stroke, Style, unByKey, VectorSource, Feature, Geometry, Polygon, LineString, Circle, getLength, getArea } from 'src/app/core/modules/openlayers';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { LayersTools } from '../../tools/layers';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { MapBrowserEvent } from 'ol';
import OverlayPositioning from 'ol/OverlayPositioning';
import { EventsKey } from 'ol/events';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})
export class MeasureComponent implements OnInit {
  @Input() map: Map | undefined;

  draw: Draw | undefined;

  source: VectorSource = new VectorSource();

  sketch: Feature<Geometry> | undefined;

  helpTooltipElement: HTMLElement | undefined;

  helpTooltip: Overlay | undefined;

  measureTooltipElement: HTMLElement | undefined;

  measureTooltip: Overlay | undefined;

  continuePolygonMsg: string = 'Click to continue drawing the polygon';

  continueLineMsg: string = 'Click to continue drawing the line';

  helpMsg = 'Click to start drawing';

  event_measure: EventsKey | EventsKey[] | undefined;

  listener: EventsKey | EventsKey[] | undefined ;

  vector;

  public measureModel: {
    Polygon: { active: boolean };
    LineString: { active: boolean };
    Circle: { active: boolean };
  } = {
    Polygon: { active: false },
    LineString: { active: false },
    Circle: { active: false }
  };

  constructor(public translate: TranslateService, private _ngZone: NgZone) {
    let layersTools = new LayersTools();
    this.vector = layersTools.createVectorLayer(this.source, 'measure', 'measure');
  }

  ngOnInit(): void {
    let mapHelper = new MapHelper();
    let groupLayerShadow = mapHelper.getLayerGroupByNom('group-layer-shadow');
    this.vector.setZIndex(1000);
    groupLayerShadow.getLayers().getArray().unshift(this.vector);

    this.translate.get('tools').subscribe((res: any) => {
      this.continuePolygonMsg = res.continue_polygon_msg;
      this.continueLineMsg = res.continue_line_msg;
      this.helpMsg = res.help_msg;
    });
  }

  toogleMeasureInteraction(type: 'Polygon' | 'LineString' | 'Circle') {
    if (this.measureModel[type].active) {
      this.measureModel[type].active = false;
      this.clearDraw();
    } else {
      for (const key in this.measureModel) {
        if (this.measureModel.hasOwnProperty(key) && key != type) {
          // @ts-ignore
          const element = this.measureModel[key];
          element.active = false;
        }
      }
      this.measureModel[type].active = true;
      this.addInteraction(type);
    }
  }

  clearDraw() {
    this.removeMeasureToApps();
    if (document.querySelectorAll('.tooltip.tooltip-measure').length > 0) {
      jQuery('.tooltip.tooltip-measure').hide();
    }
    this.source.clear();
  }

  removeMeasureToApps() {
    if (this.draw) {
      this.map?.removeInteraction(this.draw);
    }

    this.sketch = undefined;
    // unset tooltip so that a new one can be created
    this.helpTooltipElement = null!;
    this.measureTooltipElement = null!;
    unByKey(this.listener!);
    unByKey(this.event_measure!);

    if (this.measureTooltip) {
      this.map?.removeOverlay(this.measureTooltip);
    }

    if (this.helpTooltip) {
      this.map?.removeOverlay(this.helpTooltip);
    }

    for (const key in this.measureModel) {
      if (this.measureModel.hasOwnProperty(key)) {
        // @ts-ignore
        const element = this.measureModel[key];
        element.active = false;
      }
    }
  }

  addInteraction(type: 'Polygon' | 'LineString' | 'Circle') {
    this.removeMeasureToApps();
    this.measureModel[type].active = true;
    this.event_measure = this.map?.on('pointermove', evt => {
      this._ngZone.run(() => {
        this.pointerMoveHandler(evt);
      });
    });
    this.draw = new Draw({
      source: this.source,
      //@ts-ignore
      type: type,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });

    this.map?.addInteraction(this.draw);

    this.createMeasureTooltip();
    this.createHelpTooltip();

    this.draw.on('drawstart', evt => {
      this.sketch = evt.feature;

      //@ts-ignore
      let tooltipCoord = evt.coordinate;

      this.listener = this.sketch.getGeometry()!.on('change', event => {
        let geom = event.target;
        let output : string | undefined;
        if (geom instanceof Polygon) {
          output = this.formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString || geom instanceof Circle) {
          output = this.formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
          if (geom instanceof Circle) {
            tooltipCoord = geom.getCenter();
          }
        }
        this.measureTooltipElement!.innerHTML = output!;
        this.measureTooltip?.setPosition(tooltipCoord);
      });
    });

    this.draw.on('drawend', () => {
      this.measureTooltipElement!.className = 'tooltip tooltip-measure';
      this.measureTooltip?.setOffset([0, -7]);
      this.sketch = undefined;
      this.measureTooltipElement = null!;
      this.createMeasureTooltip();
      unByKey(this.listener!);
    });
  }

  pointerMoveHandler(evt: MapBrowserEvent<any>) {
    if (evt.dragging) {
      return;
    }

    if (this.sketch) {
      let geom = this.sketch.getGeometry();
      if (geom instanceof Polygon || geom instanceof Circle) {
        this.helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        this.helpMsg = this.continueLineMsg;
      }
    }

    this.helpTooltipElement!.innerHTML = this.helpMsg;
    this.helpTooltip?.setPosition(evt.coordinate);

    this.helpTooltipElement?.classList.remove('hidden');
  }

  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement?.parentNode?.removeChild(this.measureTooltipElement);
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'tooltip tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: OverlayPositioning.BOTTOM_CENTER
    });
    this.map?.addOverlay(this.measureTooltip);
  }

  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement?.parentNode?.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: OverlayPositioning.CENTER_LEFT
    });
    this.map?.addOverlay(this.helpTooltip);
  }

  formatLength(line: any) {
    let length: number;
    if (line.getType() == 'Circle') {
       length = line.getRadius();
    } else {
       length = getLength(line);
    }

    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  }

  formatArea(polygon: Polygon) {
    let area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  }
}
