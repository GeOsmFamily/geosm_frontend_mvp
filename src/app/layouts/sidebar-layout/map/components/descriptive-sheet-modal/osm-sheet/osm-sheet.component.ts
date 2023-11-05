import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataHelper } from 'src/app/core/modules/dataHelper';
import { ApiService } from 'src/app/core/services/api/api.service';
import { ShareService } from 'src/app/core/services/geosm/share.service';
import { AttributeInterface } from '../../../interfaces/attributes';
import { DescriptiveSheet } from '../../../interfaces/descriptiveSheet';
import { ImageWMS, TileWMS, GeoJSON } from 'src/app/core/modules/openlayers';
import { MapHelper } from '../../../helpers/maphelper';
import { delayWhen, retryWhen, take, tap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { faAt, faCheck, faGlobe, faLink, faPhone, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-osm-sheet',
  templateUrl: './osm-sheet.component.html',
  styleUrls: ['./osm-sheet.component.scss']
})
export class OsmSheetComponent implements OnInit {
  @Input() descriptiveModel: DescriptiveSheet | undefined;

  @Output()
  updatemMdelDescriptiveSheet: EventEmitter<DescriptiveSheet> = new EventEmitter();

  @Output() closeDescriptiveSheet: EventEmitter<any> = new EventEmitter();

  listAttributes: AttributeInterface[] = [];

  name: string | undefined;

  adresse: string | undefined;

  osmId: number | undefined;

  osmUrl: string | undefined;

  loading: {
    properties: boolean;
    osmUrl: boolean;
  } = {
    properties: false,
    osmUrl: false
  };

  initialNumberOfAttributes: number = 5;

  configTagsOsm:
    | {
        [key: string]: {
          display: boolean;

          type: string;
          header: string;

          prefix?: string;

          surfix?: string;

          values?: { [key: string]: Object };
        };
      }
    | undefined;

  faCheck = faCheck;
  faTimes = faTimes;
  faGlobe = faGlobe;
  faPhone = faPhone;
  faAt = faAt;
  faLink = faLink;

  transcriptedText:any;
  key:string[]=[]
  values:string[]=[]

  constructor(public apiService: ApiService, public translate: TranslateService, public snackbar: MatSnackBar) {}

  ngOnDestroy(): void {
    this.name = undefined;
    this.osmId = undefined;
    this.osmUrl = undefined;
    this.initialNumberOfAttributes = 5;
  }

  async ngOnInit() {
    console.log(this.descriptiveModel)

    await this.apiService.getRequestFromOtherHost('/assets/data/config_tags.json').then(response => {
      this.configTagsOsm = response;
    });
    await this.apiService.getRequestFromOtherHost('/assets/data/transcripted_key.json').then(response => {
      this.transcriptedText = response;
    });
    if (this.descriptiveModel?.properties) {
      this.formatFeatureAttributes();
    } else {
      this.getPropertiesFromCartoServer();
    }

    this.descriptiveModel!.getShareUrl = function (environment, shareService: ShareService) {
      return (
        environment.url_frontend +
        '?' +
        shareService.shareFeature(
          this.layer.properties!['type'],
          this.layer.properties!['couche_id'],
          this.layer.properties!['group_id'],
          this.coordinates_3857,
          this.properties['osm_id']
        )
      );
    };

    this.updatemMdelDescriptiveSheet.emit(this.descriptiveModel);
  }

  formatFeatureAttributes() {


    for (var k in this.descriptiveModel?.properties) {
      if (this.descriptiveModel?.properties.hasOwnProperty(k)) {
        this.values.push(this.descriptiveModel?.properties[k]);
        this.key.push(k)
      }
  }

      this.descriptiveModel?.properties.forEach((value: any, key: any) => {

        console.log(key+ " "+value); // 0, 1, 2

    });

    this.listAttributes = [];

    if (this.descriptiveModel?.properties['name']) {
      this.name = this.descriptiveModel.properties['name'];
    }

    if (this.descriptiveModel?.properties['osm_id']) {
      this.osmId = this.descriptiveModel.properties['osm_id'];
      this.getOsmLink();
    }

    if (this.descriptiveModel?.properties['hstore_to_json']) {
      let values_hstore_to_json: AttributeInterface[] = [];
      if (typeof this.descriptiveModel.properties['hstore_to_json'] === 'object') {
        values_hstore_to_json = this._formatHtsore(this.descriptiveModel.properties['hstore_to_json']);
      } else if (typeof this.descriptiveModel.properties['hstore_to_json'] === 'string') {
        let stringToJson = function (myString: string) {
          let myObject = {};
          for (let index = 0; index < myString.split(',').length; index++) {
            const element = myString.split(',')[index];
            // @ts-ignore
            myObject[element.split(': ')[0].replace(/\s/, '')] = element.split(': ')[1];
          }
          return JSON.stringify(myObject);
        };

        try {
          let objetHstore = JSON.parse(stringToJson(this.descriptiveModel.properties['hstore_to_json']));

          values_hstore_to_json = this._formatHtsore(objetHstore);
        } catch (error) {
          console.error(error, stringToJson(this.descriptiveModel.properties['hstore_to_json']));
          values_hstore_to_json = [];
        }
      }
      for (let index = 0; index < values_hstore_to_json.length; index++) {
        const element = values_hstore_to_json[index];
        this.listAttributes.push({
          field: element.field,
          value: element.value,
          display: element.display
        });
      }
    }

    for (const key in this.descriptiveModel?.properties) {


      if (
        this.descriptiveModel?.properties.hasOwnProperty(key) &&
        this.descriptiveModel.properties[key] &&
        ['number', 'string'].indexOf(typeof this.descriptiveModel.properties[key]) != -1 &&
        ['fid', 'osm_id', 'name', 'gid', 'osm_uid', 'featureId'].indexOf(key) == -1
      ) {
        const value = this.descriptiveModel.properties[key];

        let positionOfKeyInListAttribute = DataHelper.isAttributesInObjectOfAnArray(this.listAttributes, key, value);
        if (positionOfKeyInListAttribute) {
          this.listAttributes.splice(positionOfKeyInListAttribute, 1, {
            field: key,
            value: value,
            display: true
          });
        } else {
          this.listAttributes.push({
            field: key,
            value: value,
            display: true
          });
        }
      }
    }

    this.constructAdresse();
  }

  getPropertiesFromCartoServer() {
    if (
      this.descriptiveModel?.layer.layer.getSource() instanceof ImageWMS ||
      this.descriptiveModel?.layer.layer.getSource() instanceof TileWMS
    ) {
      this.loading.properties = true;
      let url =
        this.descriptiveModel.layer.layer
          .getSource()
          .getFeatureInfoUrl(this.descriptiveModel.coordinates_3857, new MapHelper().map?.getView().getResolution(), 'EPSG:3857') +
        '&WITH_GEOMETRY=true&FI_POINT_TOLERANCE=30&FI_LINE_TOLERANCE=10&FI_POLYGON_TOLERANCE=10&INFO_FORMAT=application/json';

      this.apiService
        .getRequestFromOtherHostObserver(url)
        .pipe(
          retryWhen(errors =>
            errors.pipe(
              tap((_val: HttpErrorResponse) => {}),
              delayWhen((val: HttpErrorResponse) => timer(2000)),
              take(3)
            )
          )
        )
        .subscribe(
          (response: any) => {
            this.loading.properties = false;
            try {
              let features = new GeoJSON().readFeatures(response, {});

              if (features.length > 0) {
                let properties = features[0].getProperties();
                let geometry = features[0].getGeometry();
                this.descriptiveModel!.properties = properties;
                this.descriptiveModel!.geometry = geometry;
                console.log(properties);
                this.updatemMdelDescriptiveSheet.emit(this.descriptiveModel);

                this.formatFeatureAttributes();
              } else {
                this.closeDescriptiveSheet.emit();
              }
            } catch (error) {
              this.translate.get('dscriptive_sheet').subscribe((res: any) => {

            
              });
            }
          },
          _error => {
            this.loading.properties = false;
            this.translate.get('dscriptive_sheet').subscribe((res: any) => {
            /*  this.snackbar.open(res.server_error, res.cancel, {
                duration: 5000,
                verticalPosition: 'bottom',
                horizontalPosition: 'center'
              });*/
            });
          }
        );
    }
  }

  _formatHtsore(hstore_to_json: Object): AttributeInterface[] {
    let values: AttributeInterface[] = [];
    for (const key in hstore_to_json) {
      if (
        hstore_to_json.hasOwnProperty(key) &&
        ['osm_user', 'osm_changeset', 'osm_timestamp', 'osm_version', 'osm_uid', 'featureId'].indexOf(key) == -1
      ) {
        // @ts-ignore
        const value = hstore_to_json[key];

        values.push({
          field: key,
          value: value,
          display: true
        });
      }
    }
    return values;
  }

  getOsmLink() {
    if (this.osmId) {
      this.loading.osmUrl = true;
      let url =
        'https://nominatim.openstreetmap.org/lookup?osm_ids=R' +
        Math.abs(this.osmId) +
        ',W' +
        Math.abs(this.osmId) +
        ',N' +
        Math.abs(this.osmId) +
        '&format=json';

      this.apiService.getRequestFromOtherHost(url).then(
        (response: any) => {
          this.loading.osmUrl = false;
          if (response.length > 0) {
            let osm_type = response[0].osm_type;
            let osm_id = response[0].osm_id;
            this.osmUrl = 'https://www.openstreetmap.org/' + osm_type + '/' + osm_id;

            let osm_type_small: string;
            if (osm_type == 'relation') {
              osm_type_small = 'R';
            } else if (osm_type == 'way') {
              osm_type_small = 'W';
            } else if (osm_type == 'node') {
              osm_type_small = 'N';
            }
          }
        },
        _error => {
          this.loading.osmUrl = false;
        }
      );
    }
  }

  constructAdresse() {
    let count_adresse = 0;
    let adresse = {
      housenumber: '',
      street: '',
      city: '',
      postcode: ''
    };

    for (let index = 0; index < this.listAttributes.length; index++) {
      const element = this.listAttributes[index];
      if (element.field == 'addr:city') {
        count_adresse = count_adresse + 1;
        adresse.city = element.value;
      }
      if (element.field == 'addr:street') {
        count_adresse = count_adresse + 1;
        adresse.street = element.value;
      }
      if (element.field == 'addr:housenumber') {
        count_adresse = count_adresse + 1;
        adresse.housenumber = element.value;
      }
      if (element.field == 'addr:postcode') {
        count_adresse = count_adresse + 1;
        adresse.postcode = element.value;
      }
    }
    if (adresse.housenumber && adresse.street) {
      this.adresse = adresse.housenumber + ' ' + adresse.street + ' ' + adresse.city + ' ' + adresse.postcode;
    }
  }

  formatArea(area: any): string {
    let intArea = parseFloat(area);
    let unit: 'sqm' | 'hectar' | 'sqkm' | 'sqft' | 'sqmi' = 'sqm';
    let unitHuman = 'm²';
    if (area > 10000) {
      unit = 'hectar';
      unitHuman = 'hectare';
    }

    if (area > 100000000) {
      unit = 'sqkm';
      unitHuman = 'Km²';
    }

    return Math.round((new DataHelper().getFormattedArea(unit, intArea) + Number.EPSILON) * 100) / 100 + ' ' + unitHuman;
  }

  openUrl(url: string | URL | undefined) {
    window.open(url, '_blank');
  }

  alertValue(value: string) {
    alert(value);
  }
}
