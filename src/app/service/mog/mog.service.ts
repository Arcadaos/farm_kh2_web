import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Niveau } from '../../models/niveau';

@Injectable({
  providedIn: 'root',
})
export class MogService {
  private niveauURL = 'http://localhost:5000/api/mog';

  constructor(private http: HttpClient) {}

  getNiveauMog(user: string): Observable<Niveau> {
    return this.http.get<Niveau>(this.niveauURL + '/' + user);
  }
}
