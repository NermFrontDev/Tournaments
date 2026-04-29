import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from 'src/app/interfaces/api.interface';
import { CreateTeam, EditTeam, Team } from 'src/app/interfaces/teams.interface';
import { CreateTournament, EditTournament, RegisteredTeam, Tournament } from 'src/app/interfaces/tournament.interface';
import { TournamentService } from 'src/app/services/tournament.service';
import { TeamsService } from 'src/app/services/teams.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-volleyball-tournaments-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './volleyball-tournaments-form.component.html',
  styleUrls: ['./volleyball-tournaments-form.component.scss'],
})
export class volleyballTournamentsFormComponent {
  private router = inject(Router);
  private readonly tournamentService = inject(TournamentService)
  private readonly teamsService = inject(TeamsService)
  public tournament = signal<Tournament[]>([]);
  public tournamentDetails = signal<Tournament[]>([]);
  public teams = signal<Team[]>([]);
  searchQuery = '';
  registerSubmitted = false;
  registerForm: CreateTournament = {
    id: 0,
    sport_id: 2,
    name: '',
    description: '',
    format: '',
    start_date: '',
    end_date: '',
    location: ''
  };
  tournamentName: string = ''

  editForm: EditTournament = {
    id: 0,
    name: '',
    start_date: ''
  };
  editingTournament: any;
  name: string = ''
  editSubmitted = false;
  registeredTeams = signal<RegisteredTeam[]>([])
  teamToRegister: any
  currentTournament: number = -1

  ngOnInit(): void {
    this.loadTournaments()
  }


  get filteredtournament(): any {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.tournament();
    return this.tournament().filter(
      (t) =>
        t.name.toLowerCase().includes(q),
    );
  }

  loadTournaments() {
    this.tournamentService.getAllTournaments(2).subscribe({
      next: (response: ApiResponse<Tournament[]>) => {
        this.tournament.set(response.data)
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      },
    })

  }


 irAlTorneo(id: number) {
    this.router.navigate(['admin/volleyball/matches', id]); 
  }

  loadRegisteredTeams(id: number) {
    this.tournamentService.getRegisteredTeams(id).subscribe({
      next: (response: ApiResponse<RegisteredTeam[]>) => {
        this.registeredTeams.set(response.data)
        this.loadTeams()
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      },
    })
  }

  loadTeams() {
    this.teamsService.getAllTeams().subscribe({
      next: (response: ApiResponse<Team[]>) => {
        const registeredTeamIds = this.registeredTeams().map(team => team.team_id);

        const teams = response.data.filter(
          team => !registeredTeamIds.includes(team.id)
        );

        this.teams.set(teams);
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      },
    })
  }
  // ── Edit actions ────────────────────────────────────────────────────────────
  openEditModal(tournament: Tournament): void {
    this.editingTournament = tournament;
    this.editForm = {
      id: tournament.id,
      name: tournament.name,
      start_date: this.formatDateForInput(tournament.start_date)
    };
    this.editSubmitted = false;

    const modalEl = document.getElementById('editTournamentModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  deleteTournament(id: number): void {
    this.tournamentService.delete(id).subscribe({
      next: (response: ApiResponse<any>) => {
        this.loadTournaments()
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {
      },
    })
  }

  resetRegisterForm(): void {
    this.registerForm = {
      id: 0,
      name: '',
      description: '.',
      end_date: '',
      start_date: '',
      format: 'bracket',
      location: '.',
      sport_id: 2,
    };
    this.registerSubmitted = false;
  }

  registerTournament(): void {
    this.registerSubmitted = true;
    if (
      !this.registerForm.name
    )
      return;

    this.registerForm.description = this.registerForm.name
    this.registerForm.format = 'bracket'
    this.registerForm.location = 'general'
    this.registerForm.end_date = this.registerForm.start_date
    this.tournamentService.create(this.registerForm).subscribe({
      next: (response: ApiResponse<any>) => {
        this.resetRegisterForm();
        this.closeModal('registerTournamentModal');
        this.loadTournaments()
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  resetEditForm(): void {
    this.editingTournament = null;
    this.editForm = {
      id: 0,
      name: '',
      start_date: '',
    };
    this.editSubmitted = false;
  }

  saveChanges(): void {
    this.tournamentService.update(this.editForm.name, this.editForm.id).subscribe({
      next: (response: ApiResponse<any>) => {
        this.editSubmitted = true;
        if (!this.editForm.name)
          return;

        this.resetEditForm();
        this.closeModal('editTournamentModal');
        this.loadTournaments()
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  openTournamentModal(id: number) {
    this.currentTournament = id
    const modalEl = document.getElementById('tournamentDetails');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
    this.loadRegisteredTeams(id)
  }

  unsubscribeTeam(id: number) {
    this.tournamentService.unsubscribeTeam(id, this.currentTournament).subscribe({
      next: (response: ApiResponse<any>) => {
        this.loadRegisteredTeams(this.currentTournament)
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  registerTeam() {
    const lastSeed = Math.max(0, ...this.registeredTeams().map(team => team.seed));
    this.tournamentService.registerTeam(this.teamToRegister, lastSeed + 1, this.currentTournament).subscribe({
      next: (response: ApiResponse<any>) => {
        this.loadRegisteredTeams(this.currentTournament)
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  generateRounds() {
    this.tournamentService.generateRounds(this.currentTournament).subscribe({
      next: (response: ApiResponse<any>) => {
        alert('torneos creados')
        this.closeModal('tournamentDetails')
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  private closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }

  formatDateForInput(date: string | Date): string {
    if (!date) return '';

    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
