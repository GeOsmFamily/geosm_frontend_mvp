import { GroupesCarte } from './carte-interface';
import { ConfigInterface } from './config-interface';
import { PrincipalMapInterface } from './principal-map-interface';
import { Thematique } from './thematique-interface';

export interface ProjectInterface {
  thematiques: Thematique[];
  config: ConfigInterface;
  groupecartes: GroupesCarte[];
  principalMap: PrincipalMapInterface | null;
  [key: string]: any;
}
