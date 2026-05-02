import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiResponse } from 'src/app/interfaces/api.interface';
import { Standings, Tournament } from 'src/app/interfaces/tournament.interface';
import { ResultTableService } from 'src/app/services/result-table.service';
import { TournamentService } from 'src/app/services/tournament.service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-tournament-table',
  templateUrl: './tournament-table.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./tournament-table.component.scss']
})
export class TournamentTableComponent {
  private route = inject(ActivatedRoute);
  tournamentId: number = -1;
  sportId: number = -1
  sport = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('sport') ?? '')
    )
  );
  standingData: Standings[] = []
  public tournaments = signal<Tournament[]>([]);

  constructor(private resultTableService: ResultTableService, private tournamentService: TournamentService) { }

  ngOnInit() {
    this.sportId = this.getSportId()
    this.loadTable()
    this.loadTournaments()
  }

  getSportId(): number {
    const currentSport = this.sport();
    const sportIds: Record<string, number> = {
      'soccer': 1,
      'volleyball': 2,
      'basketball': 3
    };
    if (!currentSport) return 0;
    return sportIds[currentSport];
  }

  loadTable() {
    this.resultTableService.getStanding(this.tournamentId).subscribe({
      next: (response: ApiResponse<Standings[]>) => {
        this.standingData = response.data;

      },
      error: () => {
        /* alert('Algo salio mal') */
      },
    });
  }
  loadTournaments() {
    this.tournamentService.getAllTournaments(this.sportId).subscribe({
      next: (response: ApiResponse<Tournament[]>) => {
        this.tournaments.set(response.data)
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      },
    })

  }

}
