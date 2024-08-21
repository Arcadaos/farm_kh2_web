import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recette } from '../../models/recette';

@Injectable({
  providedIn: 'root'
})

export class RecetteService {
  private getRecettesURL = "http://localhost:5000/api/recettes"
  
  constructor(private http: HttpClient) { }

  getRecettes(): Observable<any[]> {
    return this.http.get<any[]>(this.getRecettesURL)
  }

  sendRecette(recette: Recette): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.getRecettesURL, recette, { headers })
  }
}
