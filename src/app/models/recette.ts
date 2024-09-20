import { RecetteComponent } from './recetteComponent';

export interface Recette {
  name: string;
  components: RecetteComponent[];
  rang: string;
  fait: boolean;
  fougue: boolean;
  is_niveau_sup: boolean;
  fougue_up_when_fait: boolean;
}
