'use client';

import './SearchBar.scss';

import { useTranslations } from 'next-intl';
import { useContext, useState, ChangeEvent, FormEvent } from 'react';
import { FormControl, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import logger from '../../../../logger.config.mjs';
import { AppContext } from '../../../../context/AppContextProvider';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  page: 'map_center' | 'default';
  setSearchResults?: (value: any[]) => void;
  setSearchQuery?: (value: string) => void;
  setSearchClicked?: (value: boolean) => void;
  isSearchClicked?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  page, 
  setSearchResults = () => {}, 
  setSearchQuery = () => {}, 
  setSearchClicked = () => {},
  isSearchClicked
}) => {
  const t = useTranslations();

  const [searchBarValue, setSearchBarValue] = useState('');
  const { isSigningInUser } = useContext(AppContext);

  /**
   * Dynamically retrieves the placeholder text based on the current page context.
   */
  const getPlaceholderText = (page: 'map_center' | 'default'): string => {
    return page === 'map_center'
      ? t('SHARED.MAP_CENTER.SEARCH_BAR_PLACEHOLDER')
      : t('HOME.SEARCH_BAR_PLACEHOLDER');
  };

  const placeholder = getPlaceholderText(page);

  /**
   * Handles input changes and resets search states if the field is cleared.
   * Enhanced with trimming logic to ensure clean query transitions.
   */
  const handleSearchBarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    logger.debug(`Search bar value changed: ${newValue}`);
    setSearchBarValue(newValue);

    // Reset results if the user clears the search input
    if (isSearchClicked !== undefined && isSearchClicked && newValue.trim() === '') {
      setSearchClicked(false);
      setSearchResults([]); 
      setSearchQuery(''); 
    }
  };

  /**
   * Form submission handler.
   * Optimized to sanitize the query (trimming whitespace) before invoking the search service.
   * This prevents unnecessary 500/Gateway errors caused by improper formatting (e.g., Warangkana9565 ).
   */
  const handleSubmitSearch = (event: FormEvent) => {
    event.preventDefault();
    
    // Professional Sanitization: Trim whitespace to ensure exact matches with Backend records
    const query = searchBarValue.trim();
    
    if (query) {
      logger.info(`Initiating search for query: ${query}`);
      if (onSearch) {
        onSearch(query); // Propagates the sanitized query to the parent handler
      }
    } else {
      logger.warn('Search attempted with an empty or whitespace-only query.');
    }
  };

  return (
    <div className="w-[90%] m-auto left-0 right-0 max-w-[504px] fixed top-[120px] z-10 flex">
      <div className="w-[100%] m-auto flex items-center">
        <form
          className="w-full flex items-center gap-2 justify-between"
          onSubmit={handleSubmitSearch}
        >
          <FormControl className="flex-grow mr-3">
            <TextField
              id="search-input"
              type="text"
              variant="outlined"
              color="success"
              autoComplete="off"
              className={`w-full rounded ${
                isSigningInUser ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'
              }`}
              label={isSigningInUser ? '' : placeholder}
              value={searchBarValue}
              onChange={handleSearchBarChange}
              disabled={isSigningInUser}
              InputLabelProps={{ className: 'custom-label' }}
            />
          </FormControl>
          <button
            aria-label="search"
            type="submit"
            className={`rounded-[10px] h-[55px] w-[55px] flex items-center justify-center transition-colors
              ${isSigningInUser ? 'bg-tertiary' : 'bg-primary hover:bg-opacity-80'}`}
            disabled={isSigningInUser}
          >
            <SearchIcon fontSize={'large'} className="text-[#ffc153]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
