import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../service/recette/recette.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Recette } from '../models/recette';
import { IngredientPack } from '../models/ingredientPack';
import { forkJoin } from 'rxjs';
import { RecetteComponent } from '../models/recetteComponent';
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

  constructor(private recetteService: RecetteService) { }

  ngOnInit(): void {
    forkJoin({
      recettes: this.recetteService.getRecettes(),
      ingredients: this.recetteService.getFarm()
    }).subscribe(results => {
      this.recettes = results.recettes;
      this.ingredients = results.ingredients;
      //this.initIngredients();
    })
  }

  /*initIngredients(): void {
    this.recettes.forEach(recette => this.initIngredientsOf(recette))
    console.log(this.ingredients);
    //this.initIngredientToCreate("Mithril", "Cristal", "Cristal de mithril");
    //this.initIngredientToCreate("Sérénité", "Cristal", "Cristal de sérénité");
    //this.initIngredientToCreate("Divers", "Illusion manifeste", "Illusion manifeste");
  }*/

  initIngredientToCreate(type: string, qualite: string, nomRecette: string) {
    const ingredientToCreate: Ingredient = this.ingredients
    .find(value => value.type === type)
    ?.elements
    .find(element => element.qualite === qualite) as Ingredient;
    const quantiteToCreate: number = Math.max((ingredientToCreate.quantite ?? 0) - (ingredientToCreate.possede), 0);

    this.recetteService.getRecette(nomRecette).subscribe(data => {
      const recette: Recette = data;
      recette.components.forEach(component => {
        const ingredient: Ingredient = this.ingredients
        .find(value => value.type === component.type)
        ?.elements
        .find(element => element.qualite === component.qualite) as Ingredient;
        
        ingredient.quantite = (ingredient.quantite ?? 0) + quantiteToCreate*component.quantite;
      })
    });
  }


  initIngredientsOf(recette: Recette): void {
    if (!recette.fait) {
      const tempRecette: Recette = JSON.parse(JSON.stringify(recette))
      if (recette.fougue) {
        tempRecette.components.forEach(component => component.quantite = Math.ceil(component.quantite/2))
        tempRecette.components.push(this.createFougueComponent(tempRecette, 1))
      }
      this.updateIngredientsOf(tempRecette);
    }
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

  updateIngredientsOf(recette: Recette): void {
    recette.components.forEach(component => {
      if (component.qualite === "Cristal" && component.type === "Vitalité") {
        console.log(recette);
      }
      if (this.isAnIngredientToCreate(component.qualite, component.type)) {
        this.updateIngredientToCreate(component);
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

  isAnIngredientToCreate(qualite: string, type: string) {
    return (qualite === "Cristal" && type === "Mithril") || (qualite === "Cristal" && type === "Sérénité") || (qualite === "Illusion manifeste" && type === "Divers")
  }

  updateIngredientToCreate(componentToCreate: RecetteComponent): void {
    var tempRecette: Recette;
    if (componentToCreate.qualite === "Cristal" && componentToCreate.type === "Mithril") {
      tempRecette = JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Cristal de mithril")!));
    } else if (componentToCreate.qualite === "Cristal" && componentToCreate.type === "Sérénité") {
      tempRecette = JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Cristal de sérénité")!));
    } else {
      tempRecette = JSON.parse(JSON.stringify(this.recettes.find(recette => recette.name === "Illusion manifeste")!));
    }
    tempRecette.components.forEach(component => component.quantite *= componentToCreate.quantite)
    this.updateIngredientsOf(tempRecette)
  }

  handleChangeFait(recette: Recette, fait: boolean): void {
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

  updateRecette(recette: Recette): void {
    this.recetteService.sendRecette(recette).subscribe(data => {
      console.log(data.message)
    })
  }

  updateIngredients(ingredients: IngredientPack[]): void {
    this.recetteService.sendIngredients(ingredients).subscribe(data => {
      console.log(data.message)
    })
  }

  handleChangePossede(ingredient: IngredientPack): void {
    /*const ingredientWithoutQuantite: IngredientPack = {
      ...ingredient,
      elements: ingredient.elements.map(({ qualite, possede }) => ({
        qualite,
        possede,
      })),
    };*/
    this.recetteService.sendIngredients([ingredient]).subscribe(data => {
      console.log(data.message)
    })
  }

  

}
