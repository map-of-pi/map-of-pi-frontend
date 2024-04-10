import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

import { ActionRowComponent } from './action-row/action-row.component';
import { SearchBarComponent, SearchQueryEvent } from './search-bar/search-bar.component';
import { MapComponent } from './map/map.component';
import { SnackService } from '../core/service/snack.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ActionRowComponent, MapComponent, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(SearchBarComponent) searchBarComponent!: SearchBarComponent;

  private mapSubscription!: Subscription;

  constructor(private readonly snackService: SnackService, private translateService: TranslateService, private logger: NGXLogger) {}

  ngAfterViewInit(): void {
    if (this.mapComponent) {
      this.mapSubscription = this.mapComponent.filteredShopCountChange.subscribe((count: number) => {
        this.displaySearchResultMessage(count);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.mapSubscription) {
      this.mapSubscription.unsubscribe();
    }
  }

  private displaySearchResultMessage(numberOfShopsFound: number): void {
    // Display a message based on the count of discovered shops
    if (numberOfShopsFound > 0) {
      this.snackService.showMessage(this.translateService.instant('HOME.SEARCH_RESULT_FOUND_MESSAGE', {numberOfShopsFound}));
    } else {
      this.snackService.showMessage(this.translateService.instant('HOME.SEARCH_RESULT_NOT_FOUND_MESSAGE'));
    }
  }

  passSearchQueryToMap(event: SearchQueryEvent): void {
    if (event.searchType === 'business' || event.searchType === 'product') {
      this.mapComponent.filterShops(event.query, event.searchType);
    } else {
      this.logger.error("Invalid searchType provided", event.searchType);
    }
  }

  handleSearchTypeToggled(): void {
    this.mapComponent.removeAllMarkersFromMap();
  }
}
