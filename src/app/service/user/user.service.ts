import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private niveauURL = 'http://localhost:5000/api/user';

  constructor(private http: HttpClient) {}

  getNiveauMog(user: string): Observable<User> {
    return this.http.get<User>(this.niveauURL + '/' + user);
  }

  updateNiveauMog(niveau: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.niveauURL, niveau, { headers });
  }
}
