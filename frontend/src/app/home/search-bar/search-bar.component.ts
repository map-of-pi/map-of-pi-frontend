import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { map, Observable, startWith } from 'rxjs';
import { UiStateService } from '../../core/service/ui-state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

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

  constructor(private readonly uiStateService: UiStateService, private logger: NGXLogger) {
    this.uiStateService.setShowBackButton(false);
  }

  ngOnInit() {
    this.filteredOptions$ = this.searchBarControl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this.options.filter((option) => option.toLowerCase().includes((value || '').toLowerCase()))),
    );
  }

  toggleSearchType(): void {
    this.isBusinessSearchType = !this.isBusinessSearchType;
  }

  emitSearchQuery(event: any): void {
    const query = event.target.value;
    const searchType = this.isBusinessSearchType ? 'business' : 'product';
    this.logger.info(`Search query emitted for ${searchType}: `, query);
    this.searchQuery.emit({ query, searchType });
  }
}

export interface SearchQueryEvent {
  query: string;
  searchType: string;
}
