import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  Input,
  signal,
  effect,
  SimpleChanges,
  OnChanges 
} from '@angular/core';
import { ApiResponse } from 'src/app/interfaces/api.interface';
import { Standings, Tournament } from 'src/app/interfaces/tournament.interface';
import { ResultTableService } from 'src/app/services/result-table.service';
import { TournamentService } from 'src/app/services/tournament.service';

@Component({
  standalone: true,
  selector: 'app-tournament-table',
  templateUrl: './tournament-table.component.html',
  imports: [CommonModule],
  styleUrls: ['./tournament-table.component.scss']
})
export class TournamentTableComponent{

  private resultTableService = inject(ResultTableService);
  private tournamentService = inject(TournamentService);

  @Input() sportId: number = 0;
  @Input() tournamentId: number = 0;

  standingData = signal<Standings[]>([]);
  tournaments = signal<Tournament[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
  
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && !changes['tournamentId'].firstChange) {
      if (this.tournamentId > 0) {
        this.loadTable();
      }
    }

    if (changes['sportId']) {
      if (this.sportId > 0) {
        this.loadTournaments();
      }
    }
  }

  loadTable(): void {
    if (this.tournamentId <= 0) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.resultTableService.getStanding(this.tournamentId).subscribe({
      next: (response: ApiResponse<Standings[]>) => {
        this.standingData.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error cargando tabla:', error);
        this.error.set('No se pudo cargar la tabla de posiciones');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Carga los torneos disponibles para el deporte actual
   */
  loadTournaments(): void {
    if (this.sportId <= 0) return;
    this.tournamentService.getAllTournaments(this.sportId).subscribe({
      next: (response: ApiResponse<Tournament[]>) => {
        this.tournaments.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error cargando torneos:', error);
      }
    });
  }
}
