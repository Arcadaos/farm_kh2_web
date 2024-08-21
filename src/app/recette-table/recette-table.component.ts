import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../service/recette/recette.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Recette } from '../models/recette';

@Component({
  selector: 'app-recette-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  updateRecette(recette: Recette): void {
    this.recetteService.sendRecette(recette).subscribe(data => {
      console.log(data.message)
    })
  }

}
