import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { RecetteTableComponent } from "./recette-table/recette-table.component";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { routes } from './app.routes'
import { CommonModule } from "@angular/common";
import { RecetteTableModule } from "./recette-table/recette-table.module";

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        RecetteTableModule,
        RouterModule.forRoot(routes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }