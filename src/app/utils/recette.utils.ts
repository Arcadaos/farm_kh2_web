export class RecetteUtils {

    static isRecetteOfIngredientToCreate(name: string) {
        return name === "Cristal de mithril"
        || name === "Cristal de sérénité"
        || name === "Illusion manifeste"
    }

    static calculeMaxQuantiteAFougue(quantite: number, newPossedeValue: number): number {
        return quantite - Math.max(newPossedeValue, 0)
    }

    static chooseFougueQualite(rangRecette: string): string {
        if (rangRecette === "S") return "Cristal";
        if (rangRecette === "A") return "Gemme";
        if (rangRecette === "B") return "Pierre";
        return "Eclat";
    }
}