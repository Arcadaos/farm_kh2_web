import { Ingredient } from '../models/ingredient';
import { Recette } from '../models/recette';

export class RecetteUtils {
  static isRecetteOfIngredientToCreate(name: string) {
    return (
      name === 'Cristal de mithril' ||
      name === 'Cristal de sérénité' ||
      name === 'Illusion manifeste'
    );
  }

  static calculeMaxQuantiteAFougue(
    quantite: number,
    newPossedeValue: number,
    isFait: boolean
  ): number {
    return quantite - Math.max(newPossedeValue, 0) - (isFait ? 0 : 1);
  }

  static chooseFougueQualite(rangRecette: string): string {
    if (rangRecette === 'S') return 'Cristal';
    if (rangRecette === 'A') return 'Gemme';
    if (rangRecette === 'B') return 'Pierre';
    return 'Eclat';
  }

  static fougueWasUpWhenFait(recette: Recette): boolean {
    return false;
  }
}
