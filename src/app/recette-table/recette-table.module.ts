import { NgModule } from "@angular/core";
import { RecetteTableComponent } from "./recette-table.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [RecetteTableComponent],
    imports: [CommonModule],
    exports: [RecetteTableComponent]
})
export class RecetteTableModule { }