import { Recette } from "../models/recette";
import { RecetteComponent } from "../models/recetteComponent";
import { RecetteUtils } from "../utils/recette.utils";

export class RecetteFactory {
  static getRecetteOfIngredientToCreate(recettes: Recette[], type: string, qualite: string): Recette {
    if (qualite === "Cristal" && type === "Mithril") {
      return JSON.parse(JSON.stringify(recettes.find(recette => recette.name === "Cristal de mithril")!));
    } else if (qualite === "Cristal" && type === "Sérénité") {
      return JSON.parse(JSON.stringify(recettes.find(recette => recette.name === "Cristal de sérénité")!));
    } else {
      return JSON.parse(JSON.stringify(recettes.find(recette => recette.name === "Illusion manifeste")!));
    }
  }

  static createFougueComponent(recette: Recette, quantite: number): RecetteComponent {
    return {
      'qualite' : RecetteUtils.chooseFougueQualite(recette.rang),
      'type' : "Fougue",
      'quantite' : quantite
    }
  }
}