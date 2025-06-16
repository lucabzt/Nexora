import React from 'react';
import { Box, Title, TextInput, Accordion, Text, Group, ThemeIcon } from '@mantine/core';
import { IconSearch, IconClock, IconCircleCheck, IconFile, IconQuestionMark } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';

const ChapterSidebar = ({ course, chapters }) => {
  const { chapterId } = useParams();

  // Placeholder for search functionality
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Title order={4} mb="md">{course?.name}</Title>
      <TextInput
        placeholder="Search chapters"
        icon={<IconSearch size={14} />}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        mb="md"
      />
      <Accordion variant="separated" value={chapterId}>
        {filteredChapters.map((chapter) => (
          <Accordion.Item key={chapter.id} value={String(chapter.id)}>
            <Accordion.Control>
              <Group position="apart">
                <Text weight={String(chapter.id) === chapterId ? 700 : 400}>{chapter.name}</Text>
                {/* Logic for status icon */}
                {chapter.completed ? (
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconCircleCheck size={16} />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon color="gray" variant="light" size="sm">
                    <IconClock size={16} />
                  </ThemeIcon>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {/* Placeholder for chapter content links */}
              <Text component={Link} to={`/dashboard/courses/${course.id}/chapters/${chapter.id}`}>
                <Group>
                  <IconFile size={16} />
                  <Text size="sm">Content</Text>
                </Group>
              </Text>
              <Text component={Link} to={`/dashboard/courses/${course.id}/chapters/${chapter.id}/quiz`}>
                <Group>
                  <IconQuestionMark size={16} />
                  <Text size="sm">Quiz</Text>
                </Group>
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Box>
  );
};

export default ChapterSidebar;
