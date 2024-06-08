'use client'

import './SearchBar.scss';

import { useTranslations } from 'next-intl';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';

import { FormControl } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

const SearchBar: React.FC = () => {
  const t = useTranslations();

  const [searchBarValue, setSearchBarValue] = useState('');
  const [isBusinessSearchType, setIsBusinessSearchType] = useState(true);
  const [message, setMessage] = useState('');

  const handleSearchBarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchBarValue(event.target.value);
  };
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    // Move the placeholder text up
    if(inputRef.current) {
      inputRef.current.focus();
    }
  };

  const fetchSearchResults = async (query: string, searchType: string):Promise<any[]> => {
    // fetch logic to be defined here
    // For now, it returns an empty array
    return new Promise((resolve) => resolve([]));
  };

  const setSearchQuery = (query: string, searchType: string) => {
    // setSearchQuery logic here
  };
  
  const handleSubmitSearch = async (event: FormEvent) => {
    event.preventDefault();
    const query = searchBarValue;
    if (query) {
      const searchType = isBusinessSearchType ? 'business' : 'product';
      console.info(`Search query emitted for ${searchType}: `, query);

      const searchResults = await fetchSearchResults(query, searchType);
      setSearchQuery( query, searchType );

      setMessage(`Your search found ${searchResults.length} shops. Please zoom out to view all shop markers.`); 
      console.log(message);
    }
  };

  return (
    <div className="w-[90%] m-auto left-0 right-0 max-w-[504px] fixed top-[120px] z-5 flex">
       <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!message}
        message={message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      />
      <div className="w-[100%] m-auto flex items-center">
        <form className="w-full flex items-center justify-between" onSubmit={handleSubmitSearch}>
          <FormControl className="flex-grow mr-3">
            <TextField 
              id="search-input" 
              type="text" 
              variant="outlined"
              color="success"
              className="bg-white hover:bg-gray-100 w-full rounded"
              label={t('HOME.SEARCH_BAR_PLACEHOLDER')}
              value={searchBarValue} 
              onChange={handleSearchBarChange}
              ref={inputRef}
            />
          </FormControl>
          <IconButton
            aria-label="search"
            className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center hover:bg-gray-600" 
            onClick={handleSubmitSearch}>
            <SearchIcon className="text-[#ffc153]" />
          </IconButton>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;



