import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

import { map, Observable, startWith } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

import { UiStateService } from '../../core/service/ui-state.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslateModule,
    MatButton,
    MatIcon,
    MatMiniFabButton,
    MatProgressSpinner,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit {
  filteredOptions$!: Observable<string[]>;
  options: string[] = ['R', 'Re', 'Res', 'Rest', 'Resta', 'Restau', 'Restaur', 'Restaura', 'Restauran', 'Restaurant'];
  searchBarControl = new FormControl('');

  isBusinessSearchType = true;

  @Output() searchQuery = new EventEmitter<SearchQueryEvent>();
  @Output() searchTypeToggled = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
    private readonly uiStateService: UiStateService, 
    private logger: NGXLogger
  ) {
    this.uiStateService.setShowBackButton(false);
  }

  ngOnInit() {
    this.filteredOptions$ = this.searchBarControl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this.options.filter((option) => option.toLowerCase().includes((value || '').toLowerCase()))),
    );
  }

  resetMap(): void {
    this.isBusinessSearchType = !this.isBusinessSearchType;
    this.searchTypeToggled.emit();
  }

  submitSearch(): void {
    const address = this.searchBarControl.value;
    if (address) {
      const apiKey = "1ddbc964bc124f4db4828dda2a55f22e";
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
  
      this.http.get<any>(url).subscribe(response => {
        console.log('API Response:', response);  // This should log the API response
        if (response && response.results && response.results.length > 0) {
          const { lat, lng } = response.results[0].geometry;
          this.searchQuery.emit({
            query: address,
            searchType: 'location',
            coordinates: { lat, lng }
          });
        } else {
          this.logger.error('No results found for the address:', address);
        }
      }, error => {
        this.logger.error('Geocoding error:', error);
      });
    }
  }
}  

export interface SearchQueryEvent {
  query: string;
  searchType: string;
  coordinates?: { lat: number, lng: number };
}
  