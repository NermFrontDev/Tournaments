import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from 'src/app/interfaces/api.interface';
import { CreateTeam, EditTeam, Team as Team_ } from 'src/app/interfaces/teams.interface';
import { TeamsService } from 'src/app/services/teams.service';

type TeamStatus = 'Active' | 'Suspended' | 'Disqualified' | 'Inactive';

@Component({
  standalone: true,
  selector: 'app-volleyball-team-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './volleyball-team-form.component.html',
  styleUrls: ['./volleyball-team-form.component.scss']
})
export class VolleyballTeamFormComponent {

  public teams = signal<Team_[]>([]);

  private readonly teamsService = inject(TeamsService)

  ngOnInit(): void {
    this.loadTeams()
  }

  private loadTeams(): void {
    this.teamsService.getAllTeams().subscribe({
      next: (response: ApiResponse<Team_[]>) => {
        this.teams.set(response.data)
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {

      },
    })
  }

  searchQuery = '';

  readonly statusOptions: TeamStatus[] = [
    'Active',
    'Suspended',
    'Disqualified',
    'Inactive',
  ];



  // ── Register ────────────────────────────────────────────────────────────────
  registerForm: CreateTeam = {
    id: 0,
    name: '',
    coach: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    short_name: ''
  };
  registerSubmitted = false;

  // ── Edit ────────────────────────────────────────────────────────────────────
  editingTeam: Team_ | null = null;
  editForm: EditTeam = {
    id: 0,
    name: '',
    coach: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    short_name: ''
  };
  editSubmitted = false;

  // ── Computed ────────────────────────────────────────────────────────────────
  get filteredTeams(): Team_[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.teams();
    return this.teams().filter(
      (t) =>
        t.name.toLowerCase().includes(q),
    );
  }

  get nextId(): number {
    return this.teams.length ? Math.max(...this.teams().map((t) => t.id)) + 1 : 1;
  }

  // ── Register actions ────────────────────────────────────────────────────────
  registerTeam(): void {
    this.registerSubmitted = true;
    if (
      !this.registerForm.name ||
      !this.registerForm.coach ||
      !this.registerForm.short_name
    )
      return;

    this.teamsService.saveTeam(this.registerForm).subscribe({
      next: (response: ApiResponse<any>) => {
        this.resetRegisterForm();
        this.closeModal('registerTeamModal');
        this.loadTeams()
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
      coach: '',
      contact_email: '',
      contact_phone: '',
      logo_url: '',
      short_name: ''
    };
    this.registerSubmitted = false;
  }

  // ── Edit actions ────────────────────────────────────────────────────────────
  openEditModal(team: Team_): void {
    this.editingTeam = team;
    this.editForm = {
      id: team.id,
      name: team.name,
      coach: team.coach,
      short_name: team.short_name,
      contact_email: team.contact_email,
      contact_phone: team.contact_phone,
      logo_url: team.logo_url,
    };
    this.editSubmitted = false;

    const modalEl = document.getElementById('editTeamModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  saveChanges(): void {

    this.teamsService.editTeam(this.editForm).subscribe({
      next: (response: ApiResponse<any>) => {
        this.editSubmitted = true;
        if (!this.editForm.name || !this.editForm.coach)
          return;

        this.resetEditForm();
        this.closeModal('editTeamModal');
        this.loadTeams()
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })


  }

  resetEditForm(): void {
    this.editingTeam = null;
    this.editForm = {
      id: 0,
      name: '',
      coach: '',
      contact_email: '',
      contact_phone: '',
      logo_url: '',
      short_name: ''
    };
    this.editSubmitted = false;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  deleteTeam(id: number): void {
    this.teamsService.deleteTeam(id).subscribe({
      next: (response: ApiResponse<any>) => {

        this.loadTeams()
      },
      error: (error: HttpErrorResponse) => {
        alert('Algo salió mal')
      },
      complete: () => {

      },
    })
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }
}
