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
  providedIn: 'root'
})
export class IngredientService {
  private farmURL = "http://localhost:5000/api/farm"

  constructor(private http: HttpClient) { }

  getIngredients(): Observable<IngredientPack[]> {
    return this.http.get<IngredientPack[]>(this.farmURL)
  }

  updateIngredients(ingredients: IngredientPack[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.farmURL, ingredients, { headers });
  }

  updateIngredientsOf(recette: Recette, recettes: Recette[], ingredients: IngredientPack[]): void {
    recette.components.forEach(component => {
      if (IngredientUtils.isAnIngredientToCreate(component.qualite, component.type)) {
        this.updateIngredientToCreateFromComponent(component, recettes, ingredients);
      }
      for (const ingredientPack of ingredients) {
        if (ingredientPack.type === component.type) {

          for (const ingredient of ingredientPack.elements) {
            if (ingredient.qualite === component.qualite) {
              ingredient.quantite = (ingredient.quantite ?? 0) + component.quantite;
              break;
            }
          }
          break;
        }
      }
    })
  }

  updateIngredientToCreateFromComponent(componentToCreate: RecetteComponent, recettes: Recette[], ingredients: IngredientPack[]): void {
    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(recettes, componentToCreate.type, componentToCreate.qualite)
    tempRecette.components.forEach(component => component.quantite *= componentToCreate.quantite)
    this.updateIngredientsOf(tempRecette, recettes, ingredients)
  }

  handleChangePossede(ingredient: Ingredient, newPossedeValue: number, recettes: Recette[], ingredients: IngredientPack[], ingredientsToCreate: Ingredient[]): Observable<any> { 
    const updateCalls: { [key: string]: Observable<any>} = { 
      changeQuantiteAFougueResponse: of(null),
      changePossedeResponse: of(null)
    }
    
    if (IngredientUtils.isAnIngredientToCreate(ingredient.qualite, ingredient.type)) {
      updateCalls['changeQuantiteAFougueResponse'] = this.updateIngredientToCreateAfterChangePossede(ingredient, newPossedeValue ?? 0, recettes, ingredients, ingredientsToCreate)
    }
    ingredient.possede = newPossedeValue ?? 0
    updateCalls['changePossedeResponse'] = this.updateIngredients(ingredients)
    return forkJoin(updateCalls);
  }

  updateIngredientToCreateAfterChangePossede(ingredient: Ingredient, newPossedeValue: number, recettes: Recette[], ingredients: IngredientPack[], ingredientsToCreate: Ingredient[]): Observable<any> {
    var changeQuantiteAFougueResponse: Observable<any> = of(null);

    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(recettes, ingredient.type, ingredient.qualite)
    const quantiteRestante: number = IngredientUtils.calculeQuantiteRestante(ingredient.possede, newPossedeValue, ingredient.quantite);
    const ingredientToCreate: Ingredient = IngredientFactory.getIngredientToCreate(ingredientsToCreate, ingredient.type, ingredient.qualite)
    if ((ingredientToCreate.quantiteAFougue ?? 0) > (ingredient.quantite - newPossedeValue)) {
      ingredientToCreate.quantiteAFougue = Math.max(ingredient.quantite - newPossedeValue, 0)
      changeQuantiteAFougueResponse = this.handleChangeQuantiteAFougue(ingredient, ingredientToCreate.quantiteAFougue, recettes, ingredients)
    }
    tempRecette.components.forEach(component => component.quantite *= -quantiteRestante)
    this.updateIngredientsOf(tempRecette, recettes, ingredients)
    return changeQuantiteAFougueResponse;
  }

  handleChangeQuantiteAFougue(ingredient: Ingredient, newQuantiteAFougue: number, recettes: Recette[], ingredients: IngredientPack[]): Observable<any> {
    const tempRecette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(recettes, ingredient.type, ingredient.qualite)
    const deltaQuantiteAFougue: number = newQuantiteAFougue - (ingredient.quantiteAFougue ?? 0)
    tempRecette.components.forEach(component => component.quantite = -deltaQuantiteAFougue*Math.floor(component.quantite/2))
    tempRecette.components.push(RecetteFactory.createFougueComponent(tempRecette, deltaQuantiteAFougue))
    this.updateIngredientsOf(tempRecette, recettes, ingredients)
    ingredient.quantiteAFougue = newQuantiteAFougue
    return this.updateIngredients(ingredients)
  }
}
