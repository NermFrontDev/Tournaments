import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface TeamStat {
  id: number;
  name: string;
  coach: string;
  status: 'Active' | 'Suspended' | 'Disqualified' | 'Inactive';
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

@Component({
  standalone: true,
  selector: 'app-overview',
  imports: [CommonModule],
  templateUrl: './overview-soccer.component.html',
  styleUrls: ['./overview-soccer.component.scss'],
})
export class OverviewSoccerComponent {
  constructor(private router: Router) {}

  // ── Summary stats ──────────────────────────────────────────────────────────
  totalTeams = 3;
  matchesPlayed = 24;
  pendingMatches = 8;
  totalGoals = 89;

  // ── Teams with stats ───────────────────────────────────────────────────────
  teams: TeamStat[] = [
    {
      id: 1,
      name: 'Eagles',
      coach: 'Mark Spencer',
      status: 'Active',
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 22,
      goalsAgainst: 9,
      points: 23,
    },
    {
      id: 2,
      name: 'Tigers',
      coach: 'James Wilson',
      status: 'Active',
      played: 10,
      won: 5,
      drawn: 3,
      lost: 2,
      goalsFor: 18,
      goalsAgainst: 12,
      points: 18,
    },
    {
      id: 3,
      name: 'Panthers',
      coach: 'Sarah Connor',
      status: 'Suspended',
      played: 10,
      won: 3,
      drawn: 2,
      lost: 5,
      goalsFor: 11,
      goalsAgainst: 19,
      points: 11,
    },
  ];

  // ── Computed ───────────────────────────────────────────────────────────────
  goalDiff(team: TeamStat): number {
    return team.goalsFor - team.goalsAgainst;
  }

  winRate(team: TeamStat): number {
    return team.played > 0 ? Math.round((team.won / team.played) * 100) : 0;
  }

  teamRank(team: TeamStat): number {
    return (
      [...this.teams]
        .sort(
          (a, b) => b.points - a.points || this.goalDiff(b) - this.goalDiff(a),
        )
        .findIndex((t) => t.id === team.id) + 1
    );
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  goToTeams(): void {
    this.router.navigate(['soccer/teams']);
  }
  goToMatches(): void {
    this.router.navigate(['soccer/matches']);
  }
}
