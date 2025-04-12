import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from "./side-menu/side-menu.component";
import { PlayersComponent } from "./players/players.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideMenuComponent, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ping-pong-league';
}
