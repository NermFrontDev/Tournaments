import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TournamentBracketsComponent } from 'src/app/end-user/layout/tournament-brackets/tournament-brackets.component';
import { TournamentTableComponent } from 'src/app/end-user/layout/tournament-table/tournament-table.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-basketball-matches',
  imports: [
    CommonModule,
    TournamentBracketsComponent,
    TournamentTableComponent
  ],
  templateUrl: './basketball-matches.component.html',
  styleUrls: ['./basketball-matches.component.scss']
})
export class BasketballMatchesComponent {

  activeTab: 'posTableView' | 'bracketView' = 'posTableView';

  setTab(tab: 'posTableView' | 'bracketView') {
    this.activeTab = tab;
  }

}
