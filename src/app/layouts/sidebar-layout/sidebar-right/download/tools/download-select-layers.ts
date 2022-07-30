import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { startWith } from 'rxjs/internal/operators/startWith';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import { MapHelper } from '../../../map/helpers/maphelper';
import { LayersInMap } from '../../../map/interfaces/layerinmap';
import { DownloadModelInterface, SearchLayerToDownloadModelInterface } from '../interfaces/download';

export class SelectLayersForDownload {
  downloadModel: DownloadModelInterface = {
    layers: [],
    roiType: undefined!,
    roiGeometry: undefined,
    roiBbox: undefined
  };

  formsLayers: FormGroup | undefined;
  formsLayersArray: FormArray | undefined;

  filteredLayersOptions: Array<Observable<SearchLayerToDownloadModelInterface[]>> = [];

  layersDownlodable: Array<SearchLayerToDownloadModelInterface> = [];

  constructor(public fb: FormBuilder, public thematiqueService: ThematiqueService) {}

  initialiseFormsLayers() {
    this.formsLayers = this.fb.group({
      layers: this.fb.array([this.createInputFormsLayer()])
    });
    new MapHelper().map?.getLayers().on('propertychange', _ObjectEvent => {
      this.addAllLayersInTOC();
    });
  }

  removeInputInFormsLayer(i: number) {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    this.formsLayersArray.removeAt(i);
    this.filteredLayersOptions.splice(i, 1);
    this.loadAllLayersInModel();
  }

  addInputInFormsLayer() {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    this.formsLayersArray.push(this.createInputFormsLayer());
  }

  addAllLayersInTOC() {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    if (this.getAllLayersInTOC().length > 0) {
      while (this.formsLayersArray.length > 0) {
        this.removeInputInFormsLayer(0);
      }
    }

    for (let index = 0; index < this.getAllLayersInTOC().length; index++) {
      const element = this.getAllLayersInTOC()[index];
      let form = this.createInputFormsLayer();
      form.get('layer')!.setValue(element);
      this.formsLayersArray.push(form);
    }

    this.loadAllLayersInModel();
  }

  createInputFormsLayer(): FormGroup {
    let newForm = new FormControl('');
    this.filteredLayersOptions.push(
      newForm.valueChanges.pipe(
        filter(value => typeof value == 'string'),
        startWith(''),
        map(value => this._filter(value))
      )
    );
    return this.fb.group({
      layer: newForm
    });
  }

  private _filter(value: string): SearchLayerToDownloadModelInterface[] {
    const filterValue = value.toLowerCase();
    return this.layersDownlodable.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  /**
   * Use to format text that will appear after an option is choose in the autocomplete use to select layers in the UI
   * @param layer searchLayerToDownlodModelInterface
   * @return string
   */
  displayAutocompleLayerstFn(layer: SearchLayerToDownloadModelInterface): string {
    return layer ? layer.name : '';
  }

  layerSelected(_option: MatAutocompleteSelectedEvent) {
    this.loadAllLayersInModel();
  }

  loadAllLayersInModel() {
    this.downloadModel.layers = [];
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    for (let index = 0; index < this.formsLayersArray.controls.length; index++) {
      const element = this.formsLayersArray.controls[index];
      let layersInForm: SearchLayerToDownloadModelInterface = element.get('layer')!.value;
      if (layersInForm.source == 'geosmCatalogue') {
        try {
          this.downloadModel.layers.push(this.thematiqueService.getCoucheFromId(layersInForm.id)!);
        } catch (error) {}
      }
    }
  }

  getAllControls(): Array<AbstractControl> {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    return this.formsLayersArray.controls;
  }

  getAllLayersDownlodable(): Array<SearchLayerToDownloadModelInterface> {
    let response: SearchLayerToDownloadModelInterface[] = [];

    for (let iThematique = 0; iThematique < this.thematiqueService.getAllThematiques().length; iThematique++) {
      const groupThematique = this.thematiqueService.getAllThematiques()[iThematique];

      for (let index = 0; index < groupThematique.sous_thematiques.length; index++) {
        const sous_thematique = groupThematique.sous_thematiques[index];
        for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
          const couche = sous_thematique.couches[jndex];
          response.push({
            name: couche.nom,
            description: groupThematique.nom + ' / ' + sous_thematique.nom,
            id: couche.id,
            source: 'geosmCatalogue'
          });
        }
      }
    }

    return response;
  }

  getAllLayersInTOC(): SearchLayerToDownloadModelInterface[] {
    let mapHelper = new MapHelper();
    let response: SearchLayerToDownloadModelInterface[] = [];

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    for (let index = 0; index < reponseLayers.length; index++) {
      const layerProp = reponseLayers[index];
      if (layerProp['type_layer'] == 'geosmCatalogue') {
        if (layerProp['properties']!['type'] == 'couche') {
          let groupThematique = this.thematiqueService.getThematiqueFromId(layerProp['properties']!['group_id']);
          layerProp['data'] = this.thematiqueService.getCoucheFromId(layerProp['properties']!['couche_id']);
          response.push({
            name: layerProp['data'].nom,
            description: groupThematique!.nom,
            id: layerProp['data'].key_couche,
            source: 'geosmCatalogue'
          });
        }
      }
    }

    return response;
  }
}
