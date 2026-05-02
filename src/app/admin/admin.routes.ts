import { Routes } from '@angular/router';
import { authGuard, sportGuard } from './auth/auth/guard/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],  // ← todas las rutas admin requieren login
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [

      {
        path: '',
        redirectTo: 'soccer/teams',
        pathMatch: 'full',
      },

      // ── Soccer ─────────────────────────────────────────────────────
      {
        path: 'soccer',
        canActivateChild: [sportGuard],  // ← solo admin o admin_sport soccer
        data: { sport: 'soccer' },
        children: [
          { path: '', redirectTo: 'teams', pathMatch: 'full' },
          /*{
            path: 'overview',
            data: { sport: 'soccer' },
            loadComponent: () =>
              import('./features/soccer/overview-soccer/overview-soccer.component')
                .then(m => m.OverviewSoccerComponent),
          }, */
          {
            path: 'teams',
            data: { sportId: 1, sport: 'soccer' },
            loadComponent: () =>
              import('../admin/features/templates/teams/teams.component')
                .then(m => m.TeamsComponent),
          },
          {
            path: 'matches/:id',
            data: { sport: 'soccer' },
            loadComponent: () =>
              import('./features/soccer/matches/soccer-match-form/soccer-match-form.component')
                .then(m => m.SoccerMatchFormComponent),
          },
          {
            path: 'tournaments',
            data: { sportId: 1, sport: 'soccer' },
            loadComponent: () =>
              import('./features/templates/tournaments/tournaments.component')
                .then(m => m.TournamentsComponent),
          },
        ],
      },

      // ── Volleyball ─────────────────────────────────────────────────
      {
        path: 'volleyball',
        canActivateChild: [sportGuard],
        data: { sport: 'volleyball' },
        children: [
          { path: '', redirectTo: 'teams', pathMatch: 'full' },
          /* {
            path: 'overview',
            data: { sport: 'volleyball' },
            loadComponent: () =>
              import('./features/volleyball/overview-volleyball/overview-volleyball.component')
                .then(m => m.OverviewVolleyballComponent),
          }, */
          {
            path: 'teams',
            data: { sportId: 2, sport: 'volleyball' },
            loadComponent: () =>
              import('../admin/features/templates/teams/teams.component')
                .then(m => m.TeamsComponent),
          },
          {
            path: 'matches/:id',
            data: { sport: 'volleyball' },
            loadComponent: () =>
              import('./features/volleyball/matches/volleyball-match-form/volleyball-match-form.component')
                .then(m => m.VolleyballMatchFormComponent),
          },
          {
            path: 'tournaments',
            data: { sportId: 2, sport: 'volleyball' },
            loadComponent: () =>
              import('./features/templates/tournaments/tournaments.component')
                .then(m => m.TournamentsComponent),
          },
        ],
      },

      // ── Basketball ─────────────────────────────────────────────────
      {
        path: 'basketball',
        canActivateChild: [sportGuard],
        data: { sport: 'basketball' },
        children: [
          { path: '', redirectTo: 'teams', pathMatch: 'full' },
          /* {
            path: 'overview',
            data: { sport: 'basketball' },
            loadComponent: () =>
              import('./features/basketball/overview-basketball/overview-basketball.component')
                .then(m => m.OverviewBasketballComponent),
          }, */
          {
            path: 'teams',
            data: { sportId: 3, sport: 'basketball' },
            loadComponent: () =>
              import('../admin/features/templates/teams/teams.component')
                .then(m => m.TeamsComponent),
          },
          {
            path: 'matches/:id',
            data: { sport: 'basketball' },
            loadComponent: () =>
              import('./features/basketball/matches/basketball-match-form/basketball-match-form.component')
                .then(m => m.BasketballMatchFormComponent),
          },
          {
            path: 'tournaments',
            data: { sportId: 3, sport: 'basketball' },
            loadComponent: () =>
              import('./features/templates/tournaments/tournaments.component')
                .then(m => m.TournamentsComponent),
          },
        ],
      },

      {
        path: '**',
        redirectTo: 'soccer/teams',
      },
    ],
  },
];
