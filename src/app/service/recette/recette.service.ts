import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  forkJoin,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { Recette } from '../../models/recette';
import { IngredientPack } from '../../models/ingredientPack';
import { RecetteUtils } from '../../utils/recette.utils';
import { Ingredient } from '../../models/ingredient';
import { IngredientFactory } from '../../factory/ingredient.factory';
import { RecetteFactory } from '../../factory/recette.factory';
import { IngredientService } from '../ingredient/ingredient.service';
import { IngredientUtils } from '../../utils/ingredient.utils';
import { MogUtils } from '../../utils/mog.utils';

@Injectable({
  providedIn: 'root',
})
export class RecetteService {
  private recettesURL = 'http://localhost:5000/api/recettes';

  constructor(
    private http: HttpClient,
    private ingredientService: IngredientService
  ) {}

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.recettesURL);
  }

  getRecette(recette: string): Observable<Recette> {
    return this.http.get<Recette>(`${this.recettesURL}/${recette}`);
  }

  updateRecette(recette: Recette): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.recettesURL, recette, { headers });
  }

  updateRecettes(recettes: Recette[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.recettesURL + '/all', recettes, { headers });
  }

  handleChangeFait(
    recette: Recette,
    fait: boolean,
    recettes: Recette[],
    ingredients: IngredientPack[],
    ingredientsToCreate: Ingredient[],
    newPossedeValueList: number[]
  ): void {
    const addOrRemoveToPossede: number = fait ? 1 : -1;
    if (RecetteUtils.isRecetteOfIngredientToCreate(recette.name)) {
      const ingredientToCreate: Ingredient =
        IngredientFactory.getIngredientToCreateOfRecette(
          ingredients,
          recette.name
        );
      const indexPack: number = IngredientUtils.getIndexOfPackIngredientOf(
        ingredientToCreate,
        ingredients
      );
      const indexIngr: number = IngredientUtils.getIndexOfIngredientInPackOf(
        ingredientToCreate,
        ingredients
      );

      newPossedeValueList[4 * indexPack + indexIngr] += addOrRemoveToPossede;
      this.ingredientService.handleChangePossede(
        ingredientToCreate,
        ingredientToCreate.possede + addOrRemoveToPossede,
        recettes,
        ingredients,
        ingredientsToCreate,
        false
      );
    }
    const recetteForChangePossede: Recette = JSON.parse(
      JSON.stringify(recette)
    );
    const recetteForChangeQuantite: Recette = JSON.parse(
      JSON.stringify(recette)
    );

    // PARTIE POSSEDE
    if (fait) {
      recette.fougue_up_when_fait = recette.fougue;
      recetteForChangePossede.components.forEach((component) => {
        recette.components
          .filter(
            (compToSave) =>
              compToSave.qualite === component.qualite &&
              compToSave.type == component.type
          )
          .forEach((compToSave) => {
            compToSave.val_enlevee_fait = recette.fougue
              ? Math.ceil(component.a_farm / 2)
              : component.a_farm;
          });

        component.quantite = -(recette.fougue
          ? Math.ceil(component.a_farm / 2)
          : component.a_farm);
        component.a_farm = -(recette.fougue
          ? Math.ceil(component.a_farm / 2)
          : component.a_farm);
      });
      if (recette.fougue) {
        recetteForChangeQuantite.components.push(
          RecetteFactory.createFougueComponent(recetteForChangePossede, -1)
        );
        recetteForChangePossede.components.push(
          RecetteFactory.createFougueComponent(recetteForChangePossede, -1)
        );
      }
    } else {
      recette.components.forEach((component) => {
        recetteForChangePossede.components
          .filter(
            (compSentToUpdate) =>
              compSentToUpdate.qualite === component.qualite &&
              compSentToUpdate.type === component.type
          )
          .forEach((compSentToUpdate) => {
            compSentToUpdate.quantite = component.val_enlevee_fait;
            compSentToUpdate.a_farm = component.val_enlevee_fait;
          });
      });
      if (recette.fougue_up_when_fait) {
        recetteForChangePossede.components.push(
          RecetteFactory.createFougueComponent(recetteForChangePossede, 1)
        );
      }
    }

    // PARTIE QUANTITE
    recetteForChangeQuantite.components.forEach((component) => {
      component.quantite =
        -addOrRemoveToPossede *
        (recette.fougue ? Math.ceil(component.a_farm / 2) : component.a_farm);
      component.a_farm =
        -addOrRemoveToPossede *
        (recette.fougue ? Math.ceil(component.a_farm / 2) : component.a_farm);
    });
    if (recette.fougue) {
      recetteForChangeQuantite.components.push(
        RecetteFactory.createFougueComponent(
          recetteForChangePossede,
          -addOrRemoveToPossede
        )
      );
    }

    this.ingredientService.updateIngredientsOf(
      recetteForChangeQuantite,
      recettes,
      ingredients
    );
    this.ingredientService.handleChangePossedeAfterFaitOf(
      recetteForChangePossede,
      recettes,
      ingredients,
      newPossedeValueList
    );
    this.ingredientService.verifChangeQuantiteAFougueOf(
      recette,
      recettes,
      ingredients
    );
  }

  handleChangeFougue(
    recette: Recette,
    fougue: boolean,
    recettes: Recette[],
    ingredients: IngredientPack[],
    niveauMog: number
  ): void {
    if (!recette.fait) {
      const tempRecette: Recette = JSON.parse(JSON.stringify(recette));
      if (fougue) {
        tempRecette.components.forEach((component) => {
          component.quantite = -Math.floor(component.a_farm / 2);
          component.a_farm = -Math.floor(component.a_farm / 2);
        });
      } else {
        tempRecette.components.forEach((component) => {
          component.a_farm = MogUtils.hasMogBonus(recette, niveauMog)
            ? Math.ceil(component.quantite / 2) - component.a_farm
            : component.quantite - component.a_farm;
          component.quantite = Math.floor(component.quantite / 2);
        });
      }
      tempRecette.components.push(
        RecetteFactory.createFougueComponent(tempRecette, fougue ? 1 : -1)
      );
      this.ingredientService.updateIngredientsOf(
        tempRecette,
        recettes,
        ingredients
      );
      this.ingredientService.verifChangeQuantiteAFougueOf(
        recette,
        recettes,
        ingredients
      );
    }
  }
}
