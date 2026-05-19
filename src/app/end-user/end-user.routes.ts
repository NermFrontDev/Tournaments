import { Routes } from '@angular/router';

export const END_USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'soccer',
    pathMatch: 'full'
  },
  {
    path: ':sport',
    loadComponent: () =>
      import('./features/matches/components/soccer-matches/matches-shell.component')
        .then(m => m.SoccerMatchesComponent)
  }
];
