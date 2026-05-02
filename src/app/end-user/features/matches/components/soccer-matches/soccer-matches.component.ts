import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentTableComponent } from 'src/app/end-user/layout/tournament-table/tournament-table.component';
import { TournamentBracketsComponent } from 'src/app/end-user/layout/tournament-brackets/tournament-brackets.component';

@Component({
  standalone: true,
  selector: 'app-soccer-matches',
  imports: [
    CommonModule,
    TournamentTableComponent,
    TournamentBracketsComponent
  ],
  templateUrl: './soccer-matches.component.html',
  styleUrls: ['./soccer-matches.component.scss']
})
export class SoccerMatchesComponent {

  activeTab: 'posTableView' | 'bracketView' = 'posTableView';

  setTab(tab: 'posTableView' | 'bracketView') {
    this.activeTab = tab;
  }

}
