import { Component, OnInit, Signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { CurrentUserService } from '../../core/service/current-user.service';
import { GeolocationService } from '../../core/service/geolocation.service';
import { SocialComponent } from '../../dialogs/social/social.component';

@Component({
  selector: 'app-action-row',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule, MatDialogModule],
  templateUrl: './action-row.component.html',
  styleUrl: './action-row.component.scss',
})
export class ActionRowComponent implements OnInit {
  geoLoading: Signal<boolean>;
  currentUser: any;

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly router: Router,
    private currentUserService: CurrentUserService,
    public dialog: MatDialog,
    private logger: NGXLogger) {
      this.geoLoading = this.geolocationService.geoLoading;
      this.currentUser = this.currentUserService.getCurrentUser();
  }

  locateMe(): void {
    this.geolocationService.triggerGeolocation();
  }

  navigateToBusiness(): void {
    this.router.navigate(['/business']);
  }

  openDialog() {
    const dialogRef = this.dialog.open(SocialComponent, {
      data: {
        name: this.currentUser.username,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed : ' + result);
      if (result === 'true') {
        this.logger.info('User refused');
      } else if (result === 'false') {
        localStorage.setItem('joined', 'true');
      }
    });
  }

  ngOnInit(): void {
    const userJoined = localStorage.getItem('joined');
    if (userJoined === 'true') {
      return;
    } else {
      if (this.currentUserService.getCurrentUser() !== undefined && this.currentUserService.getCurrentUser() !== null) {
        setTimeout(() => {
          // Load current user asynchronously and open dialog once loaded
          this.currentUserService.getCurrentUser().subscribe((user: any) => {
            if (user) {
              this.currentUser = user;
              this.openDialog();
            }
          });
        }, 6000);
      } else {
        this.logger.error('Failed to retrieve user');
      }
    }
  }
}
