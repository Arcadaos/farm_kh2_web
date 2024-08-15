import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../recette.service';

@Component({
  selector: 'app-recette-table',
  templateUrl: './recette-table.component.html',
  styleUrl: './recette-table.component.css',
})

export class RecetteTableComponent implements OnInit {

  recettes: any[] = [];

  constructor(private recetteService: RecetteService) { }

  ngOnInit(): void {
      this.recetteService.getRecettes().subscribe(data => {
        this.recettes = data;
      })
  }

}
