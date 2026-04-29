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
            data: { sport: 'soccer' },
            loadComponent: () =>
              import('../admin/features/soccer/teams/soccer-team-form/soccer-team-form.component')
                .then(m => m.SoccerTeamFormComponent),
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
            data: { sport: 'soccer' },
            loadComponent: () =>
              import('./features/soccer/tournaments/soccer-tournaments-form.component')
                .then(m => m.soccerTournamentsFormComponent),
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
            data: { sport: 'volleyball' },
            loadComponent: () =>
              import('./features/volleyball/teams/volleyball-team-form/volleyball-team-form.component')
                .then(m => m.VolleyballTeamFormComponent),
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
            data: { sport: 'volleyball' },
            loadComponent: () =>
              import('./features/volleyball/tournaments/volleyball-tournaments-form.component')
                .then(m => m.volleyballTournamentsFormComponent),
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
            data: { sport: 'basketball' },
            loadComponent: () =>
              import('./features/basketball/teams/basketball-team-form/basketball-team-form.component')
                .then(m => m.BasketballTeamFormComponent),
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
            data: { sport: 'basketball' },
            loadComponent: () =>
              import('./features/basketball/tournaments/basketball-tournaments-form.component')
                .then(m => m.basketballTournamentsFormComponent),
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
