import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { PlayerCardComponent } from './components/player-card/player-card.component';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  catchError,
  combineLatest,
  EMPTY,
  map,
  Subject,
  takeUntil,
} from 'rxjs';
import { AttributesService } from './service/attributes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsComponent } from './components/settings/settings.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Attributes } from './entities/attributes/attributes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ActionButtonComponent,
    PlayerCardComponent,
    MatFabButton,
    MatIcon,
    MatProgressSpinnerModule,
    SettingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  private unsubscribe$ = new Subject<boolean>();
  firstAttributes!: Attributes;
  secondAttributes!: Attributes;
  gameLogs: Attributes[][] = [];
  isLoading = false;
  currentTask = [
    {
      label: 'Wyznacz atrybuty graczy',
      icon: 'person_add',
      api_url: 'people',
    },
    {
      label: 'Wyznacz atrybuty statków',
      icon: 'rocket_launch',
      api_url: 'starships',
    },
    {
      label: 'Wyznacz zwycięzcę',
      icon: 'trophy',
    },
    {
      label: 'Zagraj ponownie',
      icon: 'replay',
    },
  ];
  progressStepper = 0;
  lastSelectedNumber = 0;

  constructor(
    private readonly attributesService: AttributesService,
    private readonly _snackBar: MatSnackBar,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  setOnAction(stepper: number) {
    if (
      this.currentTask[stepper].api_url === 'people' ||
      this.currentTask[stepper].api_url === 'starships'
    ) {
      this.isLoading = true;
      combineLatest([
        this.attributesService.getAttributes(
          this.currentTask[stepper].api_url,
          this.randomNumber(),
        ),
        this.attributesService.getAttributes(
          this.currentTask[stepper].api_url,
          this.randomNumber(),
        ),
      ])
        .pipe(
          takeUntil(this.unsubscribe$),
          map(([firstResult, secondResult]) => {
            this.validateAttributes(firstResult);
            this.validateAttributes(secondResult);
            return [firstResult, secondResult];
          }),
          catchError(() => {
            this._snackBar.open(
              'Nie znaleziono atrybutów, za chwilę gra załaduje sie ponownie',
              'Zamknij',
              { duration: 3000 },
            );
            this.resetGame();
            return EMPTY;
          }),
        )
        .subscribe(([firstResult, secondResult]) => {
          if (this.currentTask[stepper].api_url === 'people') {
            this.firstAttributes = {
              player: {
                mass: parseInt(firstResult.result.properties.mass),
                height: parseInt(firstResult.result.properties.height),
              },
            };
            this.secondAttributes = {
              player: {
                mass: parseInt(secondResult.result.properties.mass),
                height: parseInt(secondResult.result.properties.height),
              },
            };
          }

          if (this.currentTask[stepper].api_url === 'starships') {
            this.firstAttributes = {
              ...this.firstAttributes,
              starship: { crew: parseInt(firstResult.result.properties.crew) },
            };
            this.secondAttributes = {
              ...this.secondAttributes,
              starship: { crew: parseInt(secondResult.result.properties.crew) },
            };
          }
          this.isLoading = false;
          this.progressStepper++;
        });
    } else if (this.currentTask[stepper].icon === 'trophy') {
      const isFirstPlayerWinner = this.getWinner(
        this.firstAttributes,
        this.secondAttributes,
      );
      this.firstAttributes = {
        ...this.firstAttributes,
        isWinner: isFirstPlayerWinner,
      };
      this.secondAttributes = {
        ...this.secondAttributes,
        isWinner: !isFirstPlayerWinner,
      };
      this.progressStepper++;
    } else if (this.currentTask[stepper].icon === 'replay') {
      this.replayGame();
    }
  }

  private getWinner(firstAttributes: any, secondAttributes: any) {
    const firstScore =
      firstAttributes.player.mass * firstAttributes.player.height +
      firstAttributes.starship.crew;
    const secondScore =
      secondAttributes.player.mass * secondAttributes.player.height +
      secondAttributes.starship.crew;
    return firstScore > secondScore;
  }

  private replayGame() {
    this.gameLogs.push([this.firstAttributes, this.secondAttributes]);
    this.resetGame();
  }

  private resetGame() {
    this.firstAttributes = {};
    this.secondAttributes = {};
    this.progressStepper = 0;
    this.isLoading = false;
  }

  public triggerActionOnMenu($event: string) {
    if ($event === 'download') {
      const file = new Blob([JSON.stringify(this.gameLogs)], {
        type: 'text/plain',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'gameLogs';
      link.click();
      link.remove();
      this._snackBar.open('Pobrano historię gry', 'Zamknij', {
        duration: 3000,
      });
    }

    if ($event === 'delete') {
      this.gameLogs = [];
      this._snackBar.open('Historia gry wyczyszczona', 'Zamknij', {
        duration: 3000,
      });
    }
  }

  private randomNumber() {
    let selectedNumber;
    do {
      selectedNumber = Math.floor(Math.random() * (50 - 10 + 1) + 10);
    } while (this.lastSelectedNumber === selectedNumber);
    this.lastSelectedNumber = selectedNumber;
    return selectedNumber;
  }

  private validateAttributes(attributes: any) {
    if (
      attributes.result.properties.mass === 'unknown' ||
      attributes.result.properties.height === 'unknown' ||
      attributes.result.properties.crew === 'unknown'
    ) {
      throw new Error();
    }
  }
}
