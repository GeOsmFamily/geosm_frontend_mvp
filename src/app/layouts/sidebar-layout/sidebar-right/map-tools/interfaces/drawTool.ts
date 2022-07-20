import {Feature} from '../../../../../core/modules/openlayers';

export interface DrawToolInterace {
  active: boolean;
  features: Array<Feature>;
}

export interface ModifyToolTypeInterface {
  active: boolean;
}

export interface ModifyToolInterface {
  active: boolean;
  geometry: ModifyToolTypeInterface;
  comment: ModifyToolTypeInterface;
  color: ModifyToolTypeInterface;
  delete: ModifyToolTypeInterface;
  interactions: Array<any>;
  key: Array<any>;
}

export interface PropertiesFeatureInterface {
  comment: string;
  color: string;
  featureId: string;
}
