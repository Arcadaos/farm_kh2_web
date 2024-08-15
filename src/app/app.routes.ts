import { Routes } from '@angular/router';
import { RecetteTableComponent } from './recette-table/recette-table.component';

export const routes: Routes = [
    { path: '', redirectTo: '/recettes', pathMatch: 'full' },
    { path: 'recettes', component: RecetteTableComponent }
];
