import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentTableComponent } from './tournament-table.component';

describe('TournamentTableComponent', () => {
  let component: TournamentTableComponent;
  let fixture: ComponentFixture<TournamentTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentTableComponent]
    });
    fixture = TestBed.createComponent(TournamentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
