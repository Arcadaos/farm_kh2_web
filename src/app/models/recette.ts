import { RecetteComponent } from "./recetteComponent";

export interface Recette {
    name: string;
    components: RecetteComponent[];
    rang: string;
    fait: boolean;
    fougue: boolean;
}