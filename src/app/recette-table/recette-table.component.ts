import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../service/recette/recette.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Recette } from '../models/recette';
import { IngredientPack } from '../models/ingredientPack';
import { forkJoin } from 'rxjs';
import { RecetteComponent } from '../models/recetteComponent';
import { Ingredient } from '../models/ingredient';
import { IngredientToCreate } from '../models/ingredientToCreate';

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
  quantiteAFougueList: IngredientToCreate[] = [];

  constructor(private recetteService: RecetteService) { }

  ngOnInit(): void {
    forkJoin({
      recettes: this.recetteService.getRecettes(),
      ingredients: this.recetteService.getFarm()
    }).subscribe(results => {
      this.recettes = results.recettes;
      this.ingredients = results.ingredients;
      this.newPossedeValueList = results.ingredients.flatMap(ingredientPack => ingredientPack.elements.map(ingredient => ingredient.possede))
      this.quantiteAFougueList = this.getIngredientsToCreate()
    })
  }

  getIngredientsToCreate(): IngredientToCreate[] {
    return this.ingredients.flatMap(ingredientPack => 
      ingredientPack.elements.map(ingredient => ({
        type: ingredientPack.type,
        qualite: ingredient.qualite,
        quantiteAFougue: ingredient.quantiteAFougue ?? 0
      } as IngredientToCreate))
    ).filter(ingredient => this.isAnIngredientToCreate(ingredient.qualite, ingredient.type))
  }

  getQuantiteAFougueOf(type: string, qualite: string): IngredientToCreate {
    return this.quantiteAFougueList.find(ingredient => ingredient.type === type && ingredient.qualite === qualite)!
  }

  getRecetteOfIngredientToCreate(type: string, qualite: string): Recette {
    if (qualite === "Cristal" && type === "Mithril") {
      return JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Cristal de mithril")!));
    } else if (qualite === "Cristal" && type === "Sérénité") {
      return JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Cristal de sérénité")!));
    } else {
      return JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Illusion manifeste")!));
    }
  }

  getIngredientToCreateOfRecette(name: string): IngredientToCreate {
    const ingredientsToCreate: IngredientToCreate[] = this.getIngredientsToCreate();
    if (name === "Cristal de mithril") {
      return JSON.parse(JSON.stringify(ingredientsToCreate.find(ingredient => ingredient.qualite === "Cristal" && ingredient.type === "Mithril")));
    } else if (name === "Cristal de sérénité") {
      return JSON.parse(JSON.stringify(ingredientsToCreate.find(ingredient => ingredient.qualite === "Cristal" && ingredient.type === "Sérénité")));
    } else {
      return JSON.parse(JSON.stringify(ingredientsToCreate.find(ingredient => ingredient.qualite === "Illusion manifeste" && ingredient.type === "Divers")));
    }
  }

  getMaxQuantiteAFougue(quantite: number, newPossedeValue: number): number {
    return quantite - Math.max(newPossedeValue, 0)
  }

  onInputFocus(possedeValue: number, index: number) {
    this.newPossedeValueList[index] = possedeValue
  }

  countNumberOfIngredients(): number {
    var result: number = 0;
    const flatList = this.ingredients.flatMap(ingredientPack => 
      ingredientPack.elements
    )
    result = flatList.length
    return result
  }

  isAnIngredientToCreate(qualite: string, type: string) {
    return (qualite === "Cristal" && type === "Mithril") 
    || (qualite === "Cristal" && type === "Sérénité") 
    || (qualite === "Illusion manifeste" && type === "Divers")
  }

  isRecetteOfIngredientToCreate(name: string) {
    return name === "Cristal de Mithril"
    || name === "Cristal de sérénité"
    || name === "Illusion manifeste"
  }

  updateIngredientsOf(recette: Recette): void {
    recette.components.forEach(component => {
      if (this.isAnIngredientToCreate(component.qualite, component.type)) {
        this.updateIngredientToCreateFromComponent(component);
      }
      for (const ingredientPack of this.ingredients) {
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

  updateIngredientToCreateFromComponent(componentToCreate: RecetteComponent): void {
    const tempRecette: Recette = this.getRecetteOfIngredientToCreate(componentToCreate.type, componentToCreate.qualite)
    tempRecette.components.forEach(component => component.quantite *= componentToCreate.quantite)
    this.updateIngredientsOf(tempRecette)
  }

  handleChangeFait(recette: Recette, fait: boolean): void {
    if (this.isRecetteOfIngredientToCreate(recette.name)) {
      const ingredientToCreate: IngredientToCreate = this.getIngredientToCreateOfRecette(recette.name)
      const ingredientInBase: Ingredient = this.ingredients
      .find(ingredientPack => ingredientPack.type === ingredientToCreate.type)!
      .elements.find(ingredient => ingredient.qualite === ingredientToCreate.qualite)!
      
      const addOrRemove: number = fait ? -1 : 1;
      ingredientInBase.quantite += addOrRemove;
      this.handleChangePossede(ingredientToCreate.type, ingredientInBase, ingredientInBase.possede)
    }
    const tempRecette: Recette = JSON.parse(JSON.stringify(recette))
    if (fait && !recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = -component.quantite)
    }
    else if (fait && recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = -Math.ceil(component.quantite/2))
      tempRecette.components.push(this.createFougueComponent(tempRecette, -1))
    }
    else if (!fait && recette.fougue) {
      tempRecette.components.forEach(component => component.quantite = Math.ceil(component.quantite/2))
      tempRecette.components.push(this.createFougueComponent(tempRecette, 1))
    }
    this.updateIngredientsOf(tempRecette)
    this.updateRecette(recette);
  }

  handleChangeFougue(recette: Recette, fougue: boolean): void {
    if (!recette.fait) {
      const tempRecette: Recette = JSON.parse(JSON.stringify(recette))
      if (fougue) {
        tempRecette.components.forEach(component => component.quantite = -Math.floor(component.quantite/2))
        tempRecette.components.push(this.createFougueComponent(tempRecette, 1))
      } else {
        tempRecette.components.forEach(component => component.quantite = Math.floor(component.quantite/2))
        tempRecette.components.push(this.createFougueComponent(tempRecette, -1))
      }
      this.updateIngredientsOf(tempRecette)
    }
    this.updateRecette(recette);
    this.updateIngredients(this.ingredients);
  }

  handleChangePossede(typeIngredient: string, ingredient: Ingredient, newPossedeValue: number): void {
    if (this.isAnIngredientToCreate(ingredient.qualite, typeIngredient)) {
      this.updateIngredientToCreateAfterChangePossede(typeIngredient, ingredient, newPossedeValue ?? 0)
    }
    ingredient.possede = newPossedeValue ?? 0
    this.updateIngredients(this.ingredients)
  }

  updateIngredientToCreateAfterChangePossede(typeIngredient: string, ingredient: Ingredient, newPossedeValue: number): void {
    const tempRecette: Recette = this.getRecetteOfIngredientToCreate(typeIngredient, ingredient.qualite)
    const quantiteRestante: number = this.calculeQuantiteRestante(ingredient.possede, newPossedeValue, ingredient.quantite);
    const ingredientToCreate: IngredientToCreate = this.getQuantiteAFougueOf(typeIngredient, ingredient.qualite)
    if (ingredientToCreate.quantiteAFougue > (ingredient.quantite - newPossedeValue)) {
      ingredientToCreate.quantiteAFougue = Math.max(ingredient.quantite - newPossedeValue, 0)
      this.handleChangeQuantiteAFougue(typeIngredient, ingredient, ingredientToCreate.quantiteAFougue)
    }
    tempRecette.components.forEach(component => component.quantite *= -quantiteRestante)
    this.updateIngredientsOf(tempRecette)
  }

  calculeQuantiteRestante(possedeInitial: number, newPossede: number, quantiteSeuil: number): number {
    const possedeInitialPositif: number = Math.max(possedeInitial, 0);
    const newPossedePositif: number = Math.max(newPossede, 0);
    const borneSuperieureIntervalle: number = Math.min(possedeInitialPositif, quantiteSeuil);
    const deltaPossede: number = newPossedePositif - borneSuperieureIntervalle;
    const quantiteRestanteInitiale: number = Math.max(quantiteSeuil - possedeInitialPositif, 0);
    const quantiteRestante: number = Math.min(quantiteRestanteInitiale , deltaPossede);
    
    return quantiteRestante;
  }

  handleChangeQuantiteAFougue(typeIngredient: string, ingredient: Ingredient, newQuantiteAFougue: number): void {
    const tempRecette: Recette = this.getRecetteOfIngredientToCreate(typeIngredient, ingredient.qualite)
    const deltaQuantiteAFougue: number = newQuantiteAFougue - (ingredient.quantiteAFougue ?? 0)
    tempRecette.components.forEach(component => component.quantite = -deltaQuantiteAFougue*Math.floor(component.quantite/2))
    tempRecette.components.push(this.createFougueComponent(tempRecette, deltaQuantiteAFougue))
    this.updateIngredientsOf(tempRecette)
    ingredient.quantiteAFougue = newQuantiteAFougue
    this.updateIngredients(this.ingredients)
  }

  

  createFougueComponent(recette: Recette, quantite: number): RecetteComponent {
    return {
      'qualite' : this.chooseFougueQualite(recette.rang),
      'type' : "Fougue",
      'quantite' : quantite
    }
  }

  chooseFougueQualite(rangRecette: string): string {
    if (rangRecette === "S") return "Cristal";
    if (rangRecette === "A") return "Gemme";
    if (rangRecette === "B") return "Pierre";
    return "Eclat";
  }

  updateRecette(recette: Recette): void {
    this.recetteService.sendRecette(recette).subscribe(data => {
      console.log(data)
    })
  }

  updateIngredients(ingredients: IngredientPack[]): void {
    this.recetteService.sendIngredients(ingredients).subscribe(data => {
      console.log(data)
    })
  }

}
