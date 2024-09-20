import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { RecetteService } from '../service/recette/recette.service';
import { IngredientService } from '../service/ingredient/ingredient.service';

import { RecetteUtils } from '../utils/recette.utils';
import { IngredientUtils } from '../utils/ingredient.utils';

import { RecetteFactory } from '../factory/recette.factory';
import { IngredientFactory } from '../factory/ingredient.factory';

import { Recette } from '../models/recette';
import { RecetteComponent } from '../models/recetteComponent';
import { IngredientPack } from '../models/ingredientPack';
import { Ingredient } from '../models/ingredient';

import { userName } from '../app.config';

import { MatButtonModule } from '@angular/material/button';
import { User } from '../models/user';
import { UserService } from '../service/user/user.service';

@Component({
  selector: 'app-recette-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './recette-table.component.html',
  styleUrl: './special_recette-table.component.css',
})
export class RecetteTableComponent implements OnInit {
  recettes: Recette[] = [];
  ingredients: IngredientPack[] = [];
  user: User = { user: '', niveau: 0 };
  previousNiveau: number = 0;
  newPossedeValueList: number[] = [];
  ingredientsToCreate: Ingredient[] = [];
  hoveredPackIndex: number | null = null;
  hoveredIngrIndex: number | null = null;
  hovered: { pack: number | null; row: number | null; column: number | null } =
    {
      pack: null,
      row: null,
      column: null,
    };

  constructor(
    private recetteService: RecetteService,
    private ingredientService: IngredientService,
    private mogService: UserService
  ) {}

  ngOnInit(): void {
    forkJoin({
      recettes: this.recetteService.getRecettes(),
      ingredients: this.ingredientService.getIngredients(),
      niveau: this.mogService.getNiveauMog(userName),
    }).subscribe((results) => {
      this.recettes = results.recettes;
      this.ingredients = results.ingredients;
      this.addTypeToIngredients();
      this.user = results.niveau;
      this.previousNiveau = this.user.niveau;
      this.newPossedeValueList = results.ingredients.flatMap((ingredientPack) =>
        ingredientPack.elements.map((ingredient) => ingredient.possede)
      );
      this.ingredientsToCreate = IngredientFactory.getIngredientsToCreate(
        this.ingredients
      );
    });
  }

  isAnIngredientToCreate(qualite: string, type: string): boolean {
    return IngredientUtils.isAnIngredientToCreate(qualite, type);
  }

  getIngredientToCreate(type: string, qualite: string): Ingredient {
    return IngredientFactory.getIngredientToCreate(
      this.ingredientsToCreate,
      type,
      qualite
    );
  }

  addTypeToIngredients(): void {
    this.ingredients.forEach((ingredientPack) =>
      ingredientPack.elements.forEach(
        (ingredient) => (ingredient.type = ingredientPack.type)
      )
    );
  }

  calculeMaxQuantiteAFougue(
    quantite: number,
    newPossedeValue: number,
    ingredient: Ingredient
  ): number {
    const recette: Recette = RecetteFactory.getRecetteOfIngredientToCreate(
      this.recettes,
      ingredient.type,
      ingredient.qualite
    );
    return RecetteUtils.calculeMaxQuantiteAFougue(
      quantite,
      newPossedeValue,
      recette.fait
    );
  }

  onInputFocus(possedeValue: number, index: number) {
    this.newPossedeValueList[index] = possedeValue;
  }

  isHovered(
    packIndex: number,
    ingrIndex: number,
    currentIngrIndex: number
  ): boolean {
    if (this.hoveredIngrIndex === 0) {
      return this.hoveredPackIndex === packIndex;
    }
    return (
      this.hoveredPackIndex === packIndex &&
      (ingrIndex === 0 || ingrIndex === this.hoveredIngrIndex)
    );
  }

  handleChangeNiveau(niveau: number): void {
    if (this.previousNiveau !== niveau) {
      // Gestion niveau 5
      if (niveau >= 5 && this.previousNiveau < 5) {
        this.processChangeNiveau(true, 'C');
      } else if (this.previousNiveau >= 5 && niveau < 5) {
        this.processChangeNiveau(false, 'C');
      }
      // Gestion niveau 6
      if (niveau >= 6 && this.previousNiveau < 6) {
        this.processChangeNiveau(true, 'B');
      } else if (this.previousNiveau >= 6 && niveau < 6) {
        this.processChangeNiveau(false, 'B');
      }
      // Gestion niveau 7
      if (niveau >= 7 && this.previousNiveau < 7) {
        this.processChangeNiveau(true, 'A');
      } else if (this.previousNiveau >= 7 && niveau < 7) {
        this.processChangeNiveau(false, 'A');
      }
      // Gestion niveau 9
      if (niveau >= 9 && this.previousNiveau < 9) {
        this.processChangeNiveau(true, 'S');
      } else if (this.previousNiveau >= 9 && niveau < 9) {
        this.processChangeNiveau(false, 'S');
      }
      this.previousNiveau = niveau;
    }
  }

  processChangeNiveau(coche: boolean, rang: string): void {
    const recettesOfIngredientsToCreate: Recette[] =
      IngredientFactory.getIngredientsToCreate(this.ingredients).map(
        (ingredient) =>
          RecetteFactory.getRecetteOfIngredientToCreate(
            this.recettes,
            ingredient.type,
            ingredient.qualite
          )
      );
    const recettesToProcessLater: Recette[] = [];
    const affectedRecettes: Recette[] = this.recettes.filter(
      (recette) => recette.rang === rang
    );

    affectedRecettes.forEach((recette) => {
      const tempRecette: Recette = JSON.parse(JSON.stringify(recette));
      tempRecette.components.forEach((component, index) => {
        const deltaSansFougue: number = coche
          ? -Math.floor(recette.components[index].quantite / 2)
          : Math.floor(recette.components[index].quantite / 2);

        recette.components[index].a_farm += deltaSansFougue;
        component.a_farm = recette.fougue
          ? (coche ? -1 : 1) * Math.floor(Math.ceil(component.quantite / 2) / 2)
          : deltaSansFougue;
      });
      if (recettesOfIngredientsToCreate.includes(recette)) {
        recettesToProcessLater.push(tempRecette);
      } else if (!recette.fait) {
        this.ingredientService.updateIngredientsOf(
          tempRecette,
          this.recettes,
          this.ingredients,
          true
        );
      }
    });
    recettesToProcessLater.forEach((recette) => {
      if (!recette.fait)
        this.ingredientService.updateIngredientsOf(
          recette,
          this.recettes,
          this.ingredients,
          false
        );
    });
  }

  handleChangeFait(recette: Recette, fait: boolean): void {
    this.recetteService.handleChangeFait(
      recette,
      fait,
      this.recettes,
      this.ingredients,
      this.ingredientsToCreate,
      this.newPossedeValueList
    );
  }

  handleChangeFougue(recette: Recette, fougue: boolean): void {
    this.recetteService.handleChangeFougue(
      recette,
      fougue,
      this.recettes,
      this.ingredients
    );
  }

  handleChangePossede(ingredient: Ingredient, newPossedeValue: number): void {
    this.ingredientService.handleChangePossede(
      ingredient,
      newPossedeValue,
      this.recettes,
      this.ingredients,
      this.ingredientsToCreate,
      false
    );
  }

  handleChangeQuantiteAFougue(
    ingredient: Ingredient,
    newQuantiteAFougue: number
  ): void {
    this.ingredientService.handleChangeQuantiteAFougue(
      ingredient,
      newQuantiteAFougue,
      this.recettes,
      this.ingredients
    );
  }

  setHovered(newHovered: {
    pack: number | null;
    row: number | null;
    column: number | null;
  }) {
    this.hovered = newHovered;
  }

  isAPackCompleted(ingredientPack: IngredientPack) {
    for (let ingredient of ingredientPack.elements) {
      if (ingredient.possede < ingredient.quantite) return false;
    }
    return true;
  }

  isAnIngredientToCreateWithoutSerenite(
    qualite: string,
    type: string
  ): boolean {
    return IngredientUtils.isAnIngredientToCreateWithoutSerenite(qualite, type);
  }

  updateRecettes(): void {
    this.recetteService
      .updateRecettes(this.recettes)
      .subscribe((result) => console.log(result));
  }

  updateIngredients(): void {
    this.ingredientService
      .updateIngredients(this.ingredients)
      .subscribe((result) => console.log(result));
  }

  updateNiveau(): void {
    this.mogService
      .updateNiveauMog(this.user)
      .subscribe((result) => console.log(result));
  }

  updateAll(): void {
    this.updateRecettes();
    this.updateIngredients();
    this.updateNiveau();
  }
}
