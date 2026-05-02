import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentBracketsComponent } from 'src/app/end-user/layout/tournament-brackets/tournament-brackets.component';
import { TournamentTableComponent } from 'src/app/end-user/layout/tournament-table/tournament-table.component';

@Component({
  standalone: true,
  selector: 'app-volleyball-matches',
  imports: [
    CommonModule,
    TournamentTableComponent,
    TournamentBracketsComponent
  ],
  templateUrl: './volleyball-matches.component.html',
  styleUrls: ['./volleyball-matches.component.scss']
})
export class VolleyballMatchesComponent {

  activeTab: 'posTableView' | 'bracketView' = 'posTableView';

  setTab(tab: 'posTableView' | 'bracketView') {
    this.activeTab = tab;
  }

  activeTabGender: 'masculino' | 'femenino' = 'masculino';

  setTabGender(gender: 'masculino' | 'femenino') {
    this.activeTabGender = gender;
  }

}
