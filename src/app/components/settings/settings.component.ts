import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {MatSlideToggle} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, MatSlideToggle
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  @Output() menuEvent = new EventEmitter<string>();
}
