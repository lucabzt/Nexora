import React, { useState, useEffect } from 'react';
import { Box, Button, Textarea, Group, Loader, ActionIcon, Text, useMantineTheme } from '@mantine/core';
import { IconEdit, IconTrash, IconCheck, IconX, IconPlus } from '@tabler/icons-react';
import { getNotes, addNote, updateNote, deleteNote } from '../../api/notesService';
import { getToolContainerStyle } from './ToolUtils';
import { useTranslation } from 'react-i18next';

function NotesTool({ courseId, chapterId, isOpen }) {
  const { t } = useTranslation('notesTool');
  const theme = useMantineTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  useEffect(() => {
    if (isOpen && chapterId) {
      loadNotes();
    }
    // eslint-disable-next-line
  }, [isOpen, chapterId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes(courseId, chapterId);
      setNotes(data.slice().reverse());
    } catch (e) {
      setNotes([]);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setLoading(true);
    try {
      await addNote(courseId, chapterId, newNoteText);
      setNewNoteText('');
      await loadNotes();
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingId(note.id);
    setNoteText(note.text);
  };

  const handleSaveEdit = async (id) => {
    if (!noteText.trim()) return;
    setLoading(true);
    try {
      await updateNote(id, noteText);
      setEditingId(null);
      setNoteText('');
      await loadNotes();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    setLoading(true);
    try {
      await deleteNote(id);
      await loadNotes();
    } finally {
      setLoading(false);
    }
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ ...getToolContainerStyle(isOpen), flexGrow: 1 }} style={{ overflowY: 'auto' }}>
      {isOpen && (
        <>
          <Text weight={500} mb="sm">{t('title')}</Text>
          <Group mb="sm" align="flex-end" noWrap>
            <Textarea
              placeholder={t('newNotePlaceholder')}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              minRows={2}
              sx={{ flex: 1 }}
            />
            <ActionIcon 
              onClick={handleAddNote} 
              disabled={loading || !newNoteText.trim()}
              size="lg"
              variant="filled"
              color="blue"
              aria-label={t('addButton')}
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
          {loading ? <Loader /> : (
            <Box>
              {notes.length === 0 && <Text color="dimmed">{t('noNotes')}</Text>}              {notes.map(note => {
                const isEditing = editingId === note.id;
                const isExpanded = expandedNotes.has(note.id);
                const needsExpansion = note.text.split('\n').length > 3 || note.text.length > 200;

                return (
                  <Box key={note.id} mb="sm" p="xs" style={{ 
                    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`, 
                    borderRadius: 4, 
                    background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                  }}>
                    {isEditing ? (
                      <Group align="flex-end">
                        <Textarea
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          minRows={2}
                          style={{ flex: 1 }}
                        />
                        <ActionIcon color="green" onClick={() => handleSaveEdit(note.id)} aria-label={t('saveNoteAriaLabel')}><IconCheck size={18} /></ActionIcon>
                        <ActionIcon color="red" onClick={() => setEditingId(null)} aria-label={t('cancelEditAriaLabel')}><IconX size={18} /></ActionIcon>
                      </Group>
                    ) : (
                      <Group position="apart" align="flex-start">
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                          <Text
                            sx={{ whiteSpace: 'pre-wrap' }}
                            lineClamp={needsExpansion && !isExpanded ? 3 : undefined}
                          >
                            {note.text}
                          </Text>
                          {needsExpansion && (
                            <Button
                              variant="subtle"
                              size="xs"
                              onClick={() => toggleNoteExpansion(note.id)}
                              compact
                              p={0}
                              mt={4}
                            >
                              {isExpanded ? t('showLess', 'Show less') : t('showMore', 'Show more')}
                            </Button>
                          )}
                        </Box>
                        <Group>
                          <ActionIcon onClick={() => handleEditNote(note)} aria-label={t('editNoteAriaLabel')}><IconEdit size={18} /></ActionIcon>
                          <ActionIcon color="red" onClick={() => handleDeleteNote(note.id)} aria-label={t('deleteNoteAriaLabel')}><IconTrash size={18} /></ActionIcon>
                        </Group>
                      </Group>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default NotesTool;
