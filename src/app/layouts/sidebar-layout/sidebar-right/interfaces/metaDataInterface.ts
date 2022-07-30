import { Couche, Metadatas } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';

export interface MetaDataInterface {
  metadata: Metadatas;
  layer: Couche;
  nom: string;
  url_prefix: string;
  exist: boolean;
}
