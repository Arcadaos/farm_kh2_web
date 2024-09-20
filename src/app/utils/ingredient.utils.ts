import { Ingredient } from '../models/ingredient';
import { IngredientPack } from '../models/ingredientPack';

export class IngredientUtils {
  static isAnIngredientToCreate(qualite: string, type: string): boolean {
    return (
      (qualite === 'Cristal' && type === 'Mithril') ||
      (qualite === 'Gemme' && type === 'Mithril') ||
      (qualite === 'Pierre' && type === 'Mithril') ||
      (qualite === 'Eclat' && type === 'Mithril') ||
      (qualite === 'Cristal' && type === 'Sérénité') ||
      (qualite === 'Illusion manifeste' && type === 'Divers')
    );
  }

  static isAnIngredientToCreateWithoutSerenite(
    qualite: string,
    type: string
  ): boolean {
    return (
      (qualite === 'Gemme' && type === 'Mithril') ||
      (qualite === 'Eclat' && type === 'Mithril') ||
      (qualite === 'Cristal' && type === 'Sérénité') ||
      (qualite === 'Illusion manifeste' && type === 'Divers')
    );
  }

  static calculeQuantiteRestante(
    possedeInitial: number,
    newPossede: number,
    quantiteSeuil: number
  ): number {
    const possedeInitialPositif: number = Math.max(possedeInitial, 0);
    const newPossedePositif: number = Math.max(newPossede, 0);
    const borneSuperieureIntervalle: number = Math.min(
      possedeInitialPositif,
      quantiteSeuil
    );
    const deltaPossede: number = newPossedePositif - borneSuperieureIntervalle;
    const quantiteRestanteInitiale: number = Math.max(
      quantiteSeuil - possedeInitialPositif,
      0
    );
    const quantiteRestante: number = Math.min(
      quantiteRestanteInitiale,
      deltaPossede
    );

    return quantiteRestante;
  }

  static getIndexOfPackIngredientOf(
    ingredient: Ingredient,
    ingredients: IngredientPack[]
  ): number {
    return ingredients.indexOf(
      ingredients.find(
        (ingredientInPack) => ingredientInPack.type === ingredient.type
      )!
    );
  }

  static getIndexOfIngredientInPackOf(
    ingredient: Ingredient,
    ingredients: IngredientPack[]
  ): number {
    return ingredients[
      this.getIndexOfPackIngredientOf(ingredient, ingredients)
    ].elements.indexOf(ingredient);
  }
}
