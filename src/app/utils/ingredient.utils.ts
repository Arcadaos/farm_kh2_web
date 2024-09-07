export class IngredientUtils {

    static isAnIngredientToCreate(qualite: string, type: string): boolean {
        return (qualite === "Cristal" && type === "Mithril") 
        || (qualite === "Cristal" && type === "Sérénité") 
        || (qualite === "Illusion manifeste" && type === "Divers")
    }

    static calculeQuantiteRestante(possedeInitial: number, newPossede: number, quantiteSeuil: number): number {
        const possedeInitialPositif: number = Math.max(possedeInitial, 0);
        const newPossedePositif: number = Math.max(newPossede, 0);
        const borneSuperieureIntervalle: number = Math.min(possedeInitialPositif, quantiteSeuil);
        const deltaPossede: number = newPossedePositif - borneSuperieureIntervalle;
        const quantiteRestanteInitiale: number = Math.max(quantiteSeuil - possedeInitialPositif, 0);
        const quantiteRestante: number = Math.min(quantiteRestanteInitiale , deltaPossede);
        
        return quantiteRestante;
    }
}