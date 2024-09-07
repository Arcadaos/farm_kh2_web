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

@Component({
  selector: 'app-recette-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recette-table.component.html',
  styleUrl: './recette-table.component.css',
})

export class RecetteTableComponent implements OnInit {

  recettes: Recette[] = [];
  ingredients: IngredientPack[] = [];
  newPossedeValueList: number[] = [];
  ingredientsToCreate: Ingredient[] = [];

  constructor(private recetteService: RecetteService, private ingredientService: IngredientService) { }

  ngOnInit(): void {
    forkJoin({
      recettes: this.recetteService.getRecettes(),
      ingredients: this.ingredientService.getIngredients()
    }).subscribe(results => {
      this.recettes = results.recettes;
      this.ingredients = results.ingredients;
      this.addTypeToIngredients();
      this.newPossedeValueList = results.ingredients.flatMap(ingredientPack => ingredientPack.elements.map(ingredient => ingredient.possede))
      this.ingredientsToCreate = IngredientFactory.getIngredientsToCreate(this.ingredients)
    })
  }

  isAnIngredientToCreate(qualite: string, type: string): boolean {
    return IngredientUtils.isAnIngredientToCreate(qualite, type);
  }

  getIngredientToCreate(type: string, qualite: string): Ingredient {
    return IngredientFactory.getIngredientToCreate(this.ingredientsToCreate, type, qualite);
  }

  addTypeToIngredients(): void {
    this.ingredients.forEach(ingredientPack => 
      ingredientPack.elements.forEach(ingredient =>
        ingredient.type = ingredientPack.type
      )
    )
  }

  calculeMaxQuantiteAFougue(quantite: number, newPossedeValue: number): number {
    return RecetteUtils.calculeMaxQuantiteAFougue(quantite, newPossedeValue)
  }

  onInputFocus(possedeValue: number, index: number) {
    this.newPossedeValueList[index] = possedeValue
  }

  handleChangeFait(recette: Recette, fait: boolean): void {
    this.recetteService.handleChangeFait(recette, fait, this.recettes, this.ingredients, this.ingredientsToCreate).subscribe(data => {
      console.log(data)
    })
  }

  handleChangeFougue(recette: Recette, fougue: boolean): void {
    this.recetteService.handleChangeFougue(recette, fougue, this.recettes, this.ingredients).subscribe(data => {
      console.log(data);
    })
  }

  handleChangePossede(ingredient: Ingredient, newPossedeValue: number): void {
    this.ingredientService.handleChangePossede(ingredient, newPossedeValue, this.recettes, this.ingredients, this.ingredientsToCreate).subscribe(data => {
      console.log(data);
    })
  }

  handleChangeQuantiteAFougue(ingredient: Ingredient, newQuantiteAFougue: number): void {
    this.ingredientService.handleChangeQuantiteAFougue(ingredient, newQuantiteAFougue, this.recettes, this.ingredients).subscribe(data => {
      console.log(data);
    })
  }

}
