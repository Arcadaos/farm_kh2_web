import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recette } from '../../models/recette';
import { IngredientPack } from '../../models/ingredientPack';

@Injectable({
  providedIn: 'root'
})

export class RecetteService {
  private recettesURL = "http://localhost:5000/api/recettes"
  private farmURL = "http://localhost:5000/api/farm"
  
  constructor(private http: HttpClient) { }

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.recettesURL)
  }

  getRecette(recette: string): Observable<Recette> {
    return this.http.get<Recette>(`${this.recettesURL}/${recette}`)
  }

  getIngredients(): Observable<IngredientPack[]> {
    return this.http.get<IngredientPack[]>('/ingredients.json');
  }

  getFarm(): Observable<IngredientPack[]> {
    return this.http.get<IngredientPack[]>(this.farmURL)
  }

  sendRecette(recette: Recette): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.recettesURL, recette, { headers });
  }
  
  sendIngredients(ingredients: IngredientPack[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.farmURL, ingredients, { headers });
  }
}
