import { Recette } from '../models/recette';

export class MogUtils {
  static hasMogBonus(recette: Recette, niveauMog: number): boolean {
    return (
      (recette.rang === 'C' && niveauMog >= 5) ||
      (recette.rang === 'B' && niveauMog >= 6) ||
      (recette.rang === 'A' && niveauMog >= 7) ||
      (recette.rang === 'S' && niveauMog >= 9)
    );
  }
}
