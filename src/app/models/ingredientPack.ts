import { Ingredient } from "./ingredient";

export interface IngredientPack {
    type: string;
    elements: Ingredient[];
}