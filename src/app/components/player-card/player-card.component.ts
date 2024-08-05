import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    MatBadgeModule,
  ],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {
  @Input() attributes!: any;
}
