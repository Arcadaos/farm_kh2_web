import { Ingredient } from '../models/ingredient';
import { IngredientPack } from '../models/ingredientPack';
import { RecetteComponent } from '../models/recetteComponent';
import { IngredientUtils } from '../utils/ingredient.utils';

export class IngredientFactory {
  static getIngredientFromComponent(
    component: RecetteComponent,
    ingredients: IngredientPack[]
  ): Ingredient {
    return ingredients
      .find((ingredientPack) => ingredientPack.type === component.type)!
      .elements.find((ingredient) => ingredient.qualite === component.qualite)!;
  }

  static getIngredientsToCreate(ingredients: IngredientPack[]): Ingredient[] {
    return ingredients
      .flatMap((ingredientPack) =>
        ingredientPack.elements.map(
          (ingredient) =>
            ({
              type: ingredient.type,
              qualite: ingredient.qualite,
              quantiteAFougue: ingredient.quantiteAFougue ?? 0,
            } as Ingredient)
        )
      )
      .filter((ingredient) =>
        IngredientUtils.isAnIngredientToCreate(
          ingredient.qualite,
          ingredient.type
        )
      );
  }

  static getIngredientToCreate(
    ingredientsToCreate: Ingredient[],
    type: string,
    qualite: string
  ): Ingredient {
    return ingredientsToCreate.find(
      (ingredient) => ingredient.type === type && ingredient.qualite === qualite
    )!;
  }

  static getIngredientToCreateOfRecette(
    ingredients: IngredientPack[],
    name: string
  ): Ingredient {
    const ingredientsToCreate: Ingredient[] =
      this.getIngredientsToCreate(ingredients);
    if (name === 'Cristal de mithril') {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Mithril',
        'Cristal'
      );
    } else if (name === 'Gemme de mithril') {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Mithril',
        'Gemme'
      );
    } else if (name === 'Pierre de mithril') {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Mithril',
        'Pierre'
      );
    } else if (name === 'Eclat de mithril') {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Mithril',
        'Eclat'
      );
    } else if (name === 'Cristal de sérénité') {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Sérénité',
        'Cristal'
      );
    } else {
      return this.getIngredientToCreate(
        ingredientsToCreate,
        'Divers',
        'Illusion manifeste'
      );
    }
  }
}
