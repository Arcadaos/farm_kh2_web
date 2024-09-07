import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of, shareReplay, tap } from 'rxjs';
import { Recette } from '../../models/recette';
import { IngredientPack } from '../../models/ingredientPack';
import { RecetteUtils } from '../../utils/recette.utils';
import { Ingredient } from '../../models/ingredient';
import { IngredientFactory } from '../../factory/ingredient.factory';
import { RecetteFactory } from '../../factory/recette.factory';
import { IngredientService } from '../ingredient/ingredient.service';

@Injectable({
  providedIn: 'root'
})

export class RecetteService {
  private recettesURL = "http://localhost:5000/api/recettes"
  
  constructor(private http: HttpClient, private ingredientService: IngredientService) { }

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.recettesURL)
  }

  getRecette(recette: string): Observable<Recette> {
    return this.http.get<Recette>(`${this.recettesURL}/${recette}`)
  }

  updateRecette(recette: Recette): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.recettesURL, recette, { headers });
  }

  handleChangeFait(recette: Recette, fait: boolean, recettes: Recette[], ingredients: IngredientPack[], ingredientsToCreate: Ingredient[]): Observable<any> {
    const updateCalls: { [key: string]: Observable<any>} = { 
      recetteResponse: of(null),
      faitIngredientsResponse: of(null)
    }
    
    if (RecetteUtils.isRecetteOfIngredientToCreate(recette.name)) {
      const ingredientToCreate: Ingredient = IngredientFactory.getIngredientToCreateOfRecette(ingredients, recette.name)
      const ingredientInBase: Ingredient = ingredients
      .find(ingredientPack => ingredientPack.type === ingredientToCreate.type)!
      .elements.find(ingredient => ingredient.qualite === ingredientToCreate.qualite)!
      
      const addOrRemove: number = fait ? -1 : 1;
      ingredientInBase.quantite += addOrRemove;
      updateCalls['possedeIngredientsResponse'] = this.ingredientService.handleChangePossede(ingredientInBase, ingredientInBase.possede, recettes, ingredients, ingredientsToCreate)
    }
    const tempRecette: Recette = JSON.parse(JSON.stringify(recette))
    if (fait && !recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = -component.quantite)
    }
    else if (fait && recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = -Math.ceil(component.quantite/2))
      tempRecette.components.push(RecetteFactory.createFougueComponent(tempRecette, -1))
    }
    else if (!fait && recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = Math.ceil(component.quantite/2))
      tempRecette.components.push(RecetteFactory.createFougueComponent(tempRecette, 1))
    }
    this.ingredientService.updateIngredientsOf(tempRecette, recettes, ingredients)
    updateCalls['faitIngredientsResponse'] = this.ingredientService.updateIngredients(ingredients)
    updateCalls['recetteResponse'] = this.updateRecette(recette);
    return forkJoin(updateCalls)
  }

  handleChangeFougue(recette: Recette, fougue: boolean, recettes: Recette[], ingredients: IngredientPack[]): Observable<any> {
    const updateCalls: { [key: string]: Observable<any>} = { 
      recetteResponse: of(null),
      ingredientsResponse: of(null)
    }

    if (!recette.fait) {
      const tempRecette: Recette = JSON.parse(JSON.stringify(recette))
      if (fougue) {
        tempRecette.components.forEach(component => component.quantite = -Math.floor(component.quantite/2))
        tempRecette.components.push(RecetteFactory.createFougueComponent(tempRecette, 1))
      } else {
        tempRecette.components.forEach(component => component.quantite = Math.floor(component.quantite/2))
        tempRecette.components.push(RecetteFactory.createFougueComponent(tempRecette, -1))
      }
      this.ingredientService.updateIngredientsOf(tempRecette, recettes, ingredients)
    }
    updateCalls['recetteResponse'] = this.updateRecette(recette);
    updateCalls['ingredientsResponse'] = this.ingredientService.updateIngredients(ingredients);
    return forkJoin(updateCalls);
  }
}
