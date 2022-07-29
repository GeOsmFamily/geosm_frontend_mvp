import { Thematique } from 'src/app/core/interfaces/thematique-interface';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';

export interface DownloadModelInterface {
  layers: Array<Couche>;

  roiType: 'all' | 'draw' | 'emprise';

  roiBbox: any;

  roiGeometry: any;
}

export interface SearchLayerToDownloadModelInterface {
  name: string;
  description: string;
  id: number;
  source: 'geosmCatalogue' | 'other';
}

export interface ResponseOfSerachLimitInterface {
  id: string;
  limitName: string;
  name: string;
  ref: string;
  geometry?: any;
  bbox: number[];
}

export interface DownloadDataModelInterface {
  index: number;
  nom: string;
  url_gpkg: string;
  number: number;
  id: number;
  layer: Couche;
  groupThematique: Thematique;
  empriseName: string;
}
