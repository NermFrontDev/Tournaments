import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentTableComponent } from 'src/app/end-user/layout/tournament-table/tournament-table.component';
import { TournamentBracketsComponent } from 'src/app/end-user/layout/tournament-brackets/tournament-brackets.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Tournament } from 'src/app/interfaces/tournament.interface';
import { TournamentService } from '../../../../../services/tournament.service';
import { ApiResponse } from 'src/app/interfaces/api.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-soccer-matches',
  imports: [
    CommonModule,
    TournamentTableComponent,
    TournamentBracketsComponent,
    FormsModule
  ],
  templateUrl: './matches-shell.component.html',
  styleUrls: ['./matches-shell.component.scss']
})
export class SoccerMatchesComponent {

  private route = inject(ActivatedRoute);
  private tournamentService = inject(TournamentService);


  activeTab = signal<'posTableView' | 'bracketView'>('posTableView');
  sport = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('sport'))
    )
  );
  selectedTournamentId = signal<number>(0);
  tournaments = signal<Tournament[]>([]);
  sportId = signal<number>(0);

  constructor() {
    effect(() => {
      const sportId = this.getSportId(this.sport() as string);
      this.sportId.set(sportId);

      if (sportId > 0) {
        this.loadTournaments();
      }
    },{ allowSignalWrites: true });
  }

  ngOnInit() {


  }

  getSportId(currentSport: string): number {
    const sportIds: Record<string, number> = {
      'soccer': 1,
      'volleyball': 2,
      'basketball': 3
    };
    if (!currentSport) return 0;
    return sportIds[currentSport];
  }

  loadTournaments(): void {
    const sportId = this.sportId();
    if (sportId <= 0) return;
    this.tournamentService.getAllTournaments(sportId).subscribe({
      next: (response: ApiResponse<Tournament[]>) => {
        this.tournaments.set(response.data);
        // Resetea la selección al cambiar de deporte
        this.selectedTournamentId.set(0);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error cargando torneos:', error);
      }
    });
  }

  setTournament(tournamentId: number): void {
    this.selectedTournamentId.set(tournamentId);
  }


  setTab(tab: 'posTableView' | 'bracketView'): void {
    this.activeTab.set(tab);
  }

}
