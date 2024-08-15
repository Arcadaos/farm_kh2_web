import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetteTableComponent } from './recette-table.component';

describe('RecetteTableComponent', () => {
  let component: RecetteTableComponent;
  let fixture: ComponentFixture<RecetteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetteTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
