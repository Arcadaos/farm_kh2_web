import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { RecetteTableComponent } from './recette-table/recette-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RecetteTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kingdom-hearts-app';
}
