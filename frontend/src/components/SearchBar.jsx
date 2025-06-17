import { useState, useRef, useEffect } from 'react';
import { TextInput, Loader, ScrollArea, Paper, Group, Text, UnstyledButton } from '@mantine/core';
import { IconSearch, IconBook, IconFileText } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { searchCoursesAndChapters, getResultUrl } from '../api/searchService';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { Box } from '@mantine/core';


const SearchBar = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [activeIndex, setActiveIndex] = useState(-1);
  const resultsRef = useRef(null);


  // Close dropdown when clicking outside or pressing Escape
  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [searchRef, closeDropdown]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isDropdownOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : 0
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < searchResults.length) {
          handleResultClick(searchResults[activeIndex]);
        } else if (searchQuery.trim() && searchResults.length > 0) {
          // If no result is selected but there are results, select the first one
          handleResultClick(searchResults[0]);
        }
        break;
        
      case 'Escape':
        closeDropdown();
        break;
        
      default:
        break;
    }
  }, [isDropdownOpen, searchResults, activeIndex, searchQuery, closeDropdown]);
  
  // Set up keyboard event listener
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isDropdownOpen, handleKeyDown]);
  
  // Scroll active result into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeElement = resultsRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      setActiveIndex(-1); // Reset active index when starting new search
      
      try {
        const results = await searchCoursesAndChapters(debouncedQuery);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(t('search.error'));
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, t]);

  const handleResultClick = useCallback((result) => {
    setSearchQuery('');
    setSearchResults([]);
    closeDropdown();
    navigate(getResultUrl(result));
  }, [navigate, closeDropdown]);

  return (
    <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 500, margin: '0 auto' }}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim() && searchResults.length > 0) {
            handleResultClick(searchResults[Math.max(0, activeIndex)]);
          }
        }}
        role="search"
        aria-label="Search courses and chapters"
      >
        <TextInput
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            setActiveIndex(-1); // Reset active index when typing
            if (value.length > 1) {
              setIsDropdownOpen(true);
            } else {
              setIsDropdownOpen(false);
            }
          }}
          onFocus={() => searchQuery.length > 1 && setIsDropdownOpen(true)}
          onKeyDown={(e) => {
            // Prevent form submission on arrow keys
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          icon={isSearching ? <Loader size={16} /> : <IconSearch size={16} />}
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-expanded={isDropdownOpen}
          sx={{
            '@media (max-width: 767px)': {
              display: 'none',
            },
          }}
        />
      </form>
      
      {isDropdownOpen && (searchQuery.length > 0 || isSearching) && (
        <Paper
          shadow="md"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            maxHeight: 400,
            overflow: 'hidden',
          }}
          role="listbox"
          id="search-results"
          aria-label="Search results"
        >
          <ScrollArea.Autosize 
            mah={400} 
            viewportRef={resultsRef}
            style={{ outline: 'none' }}
            tabIndex={-1}
          >
            {isSearching ? (
              <Box p="md" style={{ textAlign: 'center' }}>
                <Loader size="sm" variant="dots" />
              </Box>
            ) : error ? (
              <Box p="md" style={{ textAlign: 'center', color: 'var(--mantine-color-red-6)' }}>
                <Text size="sm">{error}</Text>
              </Box>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <UnstyledButton
                  key={`${result.type}-${result.id}`}
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  data-active={activeIndex === index}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    backgroundColor: activeIndex === index 
                      ? 'var(--mantine-color-gray-1)' 
                      : 'transparent',
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: activeIndex === index 
                        ? 'var(--mantine-color-dark-6)' 
                        : 'transparent',
                    },
                    '&:hover': {
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      '@media (prefers-color-scheme: dark)': {
                        backgroundColor: 'var(--mantine-color-dark-6)',
                      },
                    },
                  }}
                >
                  <Group noWrap spacing="sm">
                    {result.type === 'course' ? (
                      <IconBook size={18} />
                    ) : (
                      <IconFileText size={18} />
                    )}
                    <div>
                      <Text size="sm" weight={500} lineClamp={1}>
                        {result.title}
                      </Text>
                      <Text size="xs" color="dimmed" lineClamp={1}>
                        {result.type === 'chapter' && result.course_title && (
                          <>{result.course_title} • </>
                        )}
                        {result.type === 'course' ? t('search.course') : t('search.chapter')}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              ))
            ) : searchQuery.length > 1 ? (
              <Box p="md" style={{ textAlign: 'center' }}>
                <Text size="sm" color="dimmed">
                  {t('search.noResults')}
                </Text>
              </Box>
            ) : (
              <Box p="md" style={{ textAlign: 'center' }}>
                <Text size="sm" color="dimmed">
                  {t('search.startTyping')}
                </Text>
              </Box>
            )}
          </ScrollArea.Autosize>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;
