import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { IngredientPack } from '../../models/ingredientPack';
import { Recette } from '../../models/recette';
import { IngredientUtils } from '../../utils/ingredient.utils';
import { RecetteComponent } from '../../models/recetteComponent';
import { RecetteFactory } from '../../factory/recette.factory';
import { Ingredient } from '../../models/ingredient';
import { IngredientFactory } from '../../factory/ingredient.factory';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private farmURL = 'http://localhost:5000/api/farm';

  constructor(private http: HttpClient) {}

  getIngredients(): Observable<IngredientPack[]> {
    return this.http.get<IngredientPack[]>(this.farmURL);
  }

  updateIngredients(ingredients: IngredientPack[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.farmURL, ingredients, { headers });
  }

  updateIngredientsOf(
    recette: Recette,
    recettes: Recette[],
    ingredients: IngredientPack[]
  ): void {
    recette.components.forEach((component) => {
      if (
        IngredientUtils.isAnIngredientToCreate(
          component.qualite,
          component.type
        )
      ) {
        this.updateIngredientOfIngredientToCreateFrom(
          component,
          recettes,
          ingredients
        );
      }
      for (const ingredientPack of ingredients) {
        if (ingredientPack.type === component.type) {
          for (const ingredient of ingredientPack.elements) {
            if (ingredient.qualite === component.qualite) {
              ingredient.quantite =
                (ingredient.quantite ?? 0) + component.quantite;
              break;
            }
          }
          break;
        }
      }
    });
  }

  updateIngredientOfIngredientToCreateFrom(
    componentToCreate: RecetteComponent,
    recettes: Recette[],
    ingredients: IngredientPack[]
  ): void {
    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(
      recettes,
      componentToCreate.type,
      componentToCreate.qualite
    );
    tempRecette.components.forEach(
      (component) => (component.quantite *= componentToCreate.quantite)
    );
    this.updateIngredientsOf(tempRecette, recettes, ingredients);
  }

  verifChangeQuantiteAFougueOf(
    recette: Recette,
    recettes: Recette[],
    ingredients: IngredientPack[]
  ): void {
    recette.components.forEach((component) => {
      if (
        IngredientUtils.isAnIngredientToCreate(
          component.qualite,
          component.type
        )
      ) {
        const ingredientToCreate: Ingredient =
          IngredientFactory.getIngredientToCreate(
            IngredientFactory.getIngredientsToCreate(ingredients),
            component.type,
            component.qualite
          );
        this.updateQuantiteAFougueOfIngredientToCreate(
          ingredientToCreate,
          recette,
          recettes,
          ingredients
        );
      }
    });
  }

  updateQuantiteAFougueOfIngredientToCreate(
    ingredient: Ingredient,
    recette: Recette,
    recettes: Recette[],
    ingredients: IngredientPack[]
  ): void {
    const addRecetteNonFaite: number = recette.fait ? 0 : 1;
    const maxQuantiteAFougue: number =
      ingredient.quantite - ingredient.possede - addRecetteNonFaite;
    if ((ingredient.quantiteAFougue ?? 0) > maxQuantiteAFougue) {
      this.handleChangeQuantiteAFougue(
        ingredient,
        maxQuantiteAFougue,
        recettes,
        ingredients
      );
    }
  }

  handleChangePossede(
    ingredient: Ingredient,
    newPossedeValue: number,
    recettes: Recette[],
    ingredients: IngredientPack[],
    ingredientsToCreate: Ingredient[],
    afterFait: boolean
  ): void {
    if (
      IngredientUtils.isAnIngredientToCreate(
        ingredient.qualite,
        ingredient.type
      )
    ) {
      this.updateIngredientToCreateAfterChangePossede(
        ingredient,
        newPossedeValue ?? 0,
        recettes,
        ingredients,
        ingredientsToCreate,
        afterFait
      );
    }
    ingredient.possede = newPossedeValue ?? 0;
  }

  handleChangePossedeAfterFaitOf(
    recette: Recette,
    recettes: Recette[],
    ingredients: IngredientPack[],
    newPossedeValueList: number[]
  ) {
    recette.components.forEach((component) => {
      const ingredient: Ingredient =
        IngredientFactory.getIngredientFromComponent(component, ingredients);
      const packIndex: number = IngredientUtils.getIndexOfPackIngredientOf(
        ingredient,
        ingredients
      );
      const ingrIndex: number = IngredientUtils.getIndexOfIngredientInPackOf(
        ingredient,
        ingredients
      );
      newPossedeValueList[4 * packIndex + ingrIndex] += component.quantite;
      return this.handleChangePossede(
        ingredient,
        newPossedeValueList[4 * packIndex + ingrIndex],
        recettes,
        ingredients,
        IngredientFactory.getIngredientsToCreate(ingredients),
        true
      );
    });
  }

  updateIngredientToCreateAfterChangePossede(
    ingredient: Ingredient,
    newPossedeValue: number,
    recettes: Recette[],
    ingredients: IngredientPack[],
    ingredientsToCreate: Ingredient[],
    afterFait: boolean
  ): void {
    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(
      recettes,
      ingredient.type,
      ingredient.qualite
    );
    const createdElement: number = tempRecette.fait ? 0 : 1;
    const quantiteRestante: number = afterFait
      ? newPossedeValue - ingredient.possede
      : IngredientUtils.calculeQuantiteRestante(
          ingredient.possede,
          newPossedeValue,
          ingredient.quantite
        );
    const ingredientToCreate: Ingredient =
      IngredientFactory.getIngredientToCreate(
        ingredientsToCreate,
        ingredient.type,
        ingredient.qualite
      );
    if (
      (ingredientToCreate.quantiteAFougue ?? 0) >
      ingredient.quantite - newPossedeValue - createdElement
    ) {
      ingredientToCreate.quantiteAFougue = Math.max(
        ingredient.quantite - newPossedeValue - createdElement,
        0
      );
      this.handleChangeQuantiteAFougue(
        ingredient,
        ingredientToCreate.quantiteAFougue,
        recettes,
        ingredients
      );
    }
    tempRecette.components.forEach(
      (component) => (component.quantite *= -quantiteRestante)
    );
    this.updateIngredientsOf(tempRecette, recettes, ingredients);
  }

  handleChangeQuantiteAFougue(
    ingredient: Ingredient,
    newQuantiteAFougue: number,
    recettes: Recette[],
    ingredients: IngredientPack[]
  ) {
    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(
      recettes,
      ingredient.type,
      ingredient.qualite
    );
    const deltaQuantiteAFougue: number =
      newQuantiteAFougue - (ingredient.quantiteAFougue ?? 0);
    tempRecette.components.forEach(
      (component) =>
        (component.quantite =
          -deltaQuantiteAFougue * Math.floor(component.quantite / 2))
    );
    tempRecette.components.push(
      RecetteFactory.createFougueComponent(tempRecette, deltaQuantiteAFougue)
    );
    this.updateIngredientsOf(tempRecette, recettes, ingredients);
    ingredient.quantiteAFougue = newQuantiteAFougue;
  }
}
