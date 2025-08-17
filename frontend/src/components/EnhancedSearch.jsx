import { useState, useEffect, useRef } from 'react';
import { Input, Box, Paper, Text, Group, Badge, Loader, useMantineTheme, Progress } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconSearch, IconBook, IconFileText } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { searchCoursesAndChapters, getResultUrl } from '../api/searchService';

function EnhancedSearch({ courses, onSearchResultClick }) {
  const { t } = useTranslation('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef();
  const theme = useMantineTheme();

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      
      try {
        const searchResults = await searchCoursesAndChapters(debouncedQuery);
        // Map the API response to the expected format
        const formattedResults = searchResults.map(result => ({
          type: result.type,
          id: result.id,
          title: result.title,
          description: result.description || '',
          courseId: result.course_id,
          courseTitle: result.course_title || '',
        }));
        
        setResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
        // Keep previous results on error
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, courses]);

  const handleResultClick = (result) => {
    if (onSearchResultClick) {
      onSearchResultClick(result);
    } else {
      // Default navigation if no handler provided
      window.location.href = getResultUrl(result);
    }
    setSearchQuery('');
    setResults([]);
  };

  const showNoResults = searchQuery.length >= 2 && results.length === 0 && !loading;
  const showResults = isFocused && (loading || results.length > 0 || showNoResults);

  return (
    <Box style={{ position: 'relative', width: '100%' }} ref={searchRef}>
      <Input
        placeholder={t('search.placeholder', 'Search courses and chapters...')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<IconSearch size={16} />}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        styles={{
          input: {
            borderRadius: theme.radius.md,
            padding: '10px 16px',
            height: 'auto',
            fontSize: '0.95rem',
            borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3],
            '&:focus': {
              borderColor: theme.colors.blue[5],
              boxShadow: `0 0 0 1px ${theme.colors.blue[5]}`,
            },
          },
        }}
      />

      {showResults && (
        <Paper
          shadow="md"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            maxHeight: '400px',
            overflowY: 'auto',
            border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]}`,
            borderRadius: theme.radius.md,
          }}
        >
          {loading ? (
            <Box p="md" style={{ textAlign: 'center' }}>
              <Loader size="sm" variant="dots" />
            </Box>
          ) : results.length > 0 ? (
            <div>
              {results.map((result, index) => (
                <Box
                  key={`${result.type}-${result.id}`}
                  p="sm"
                  style={{
                    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    },
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleResultClick(result);
                  }}
                >
                  <Group spacing="sm" noWrap>
                    {result.type === 'course' ? (
                      <IconBook size={20} color={theme.colors.blue[5]} />
                    ) : (
                      <IconFileText size={20} color={theme.colors.teal[5]} />
                    )}
                    <div style={{ flex: 1 }}>
                      <Group position="apart" spacing="xs" noWrap>
                        <Text weight={600} size="sm" style={{ lineHeight: 1.3 }}>
                          {result.title}
                        </Text>
                        <Badge 
                          size="xs" 
                          color={result.type === 'course' ? 'blue' : 'teal'}
                          variant="light"
                        >
                          {result.type}
                        </Badge>
                      </Group>
                      {result.courseTitle && (
                        <Text size="xs" color="dimmed" lineClamp={1}>
                          In: {result.courseTitle}
                        </Text>
                      )}
                      <Text size="xs" color="dimmed" lineClamp={1} mt={2}>
                        {result.description}
                      </Text>
                    </div>
                  </Group>
                </Box>
              ))}
            </div>
          ) : (
            <Box p="md" style={{ textAlign: 'center' }}>
              <Text size="sm" color="dimmed">
                {t('search.noResults', { query: debouncedQuery }, `No results found for "${debouncedQuery}"`)}
              </Text>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default EnhancedSearch;
