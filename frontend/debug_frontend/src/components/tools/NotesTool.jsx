import React, { useState, useEffect } from 'react';
import { Box, Button, Textarea, Group, Loader, ActionIcon, Text, useMantineTheme } from '@mantine/core';
import { IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { getNotes, addNote, updateNote, deleteNote } from '../../api/notesService';
import { getToolContainerStyle } from './ToolUtils';

function NotesTool({ courseId, chapterId, isOpen }) {
  const theme = useMantineTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

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
      setNotes(data);
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

  return (
    <Box sx={{ ...getToolContainerStyle(isOpen), flexGrow: 1 }} style={{ overflowY: 'auto' }}>
      {isOpen && (
        <>
          <Text weight={500} mb="sm">Notizen zu diesem Kapitel</Text>
          <Group mb="sm" align="flex-end">
            <Textarea
              placeholder="Neue Notiz..."
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              minRows={2}
              style={{ flex: 1 }}
            />
            <Button onClick={handleAddNote} disabled={loading || !newNoteText.trim()}>
              Hinzufügen
            </Button>
          </Group>
          {loading ? <Loader /> : (
            <Box>
              {notes.length === 0 && <Text color="dimmed">Keine Notizen vorhanden.</Text>}              {notes.map(note => (
                <Box key={note.id} mb="sm" p="xs" style={{ 
                  border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`, 
                  borderRadius: 4, 
                  background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                }}>
                  {editingId === note.id ? (
                    <Group align="flex-end">
                      <Textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        minRows={2}
                        style={{ flex: 1 }}
                      />
                      <ActionIcon color="green" onClick={() => handleSaveEdit(note.id)}><IconCheck size={18} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => setEditingId(null)}><IconX size={18} /></ActionIcon>
                    </Group>
                  ) : (
                    <Group position="apart">
                      <Text style={{ whiteSpace: 'pre-wrap' }}>{note.text}</Text>
                      <Group>
                        <ActionIcon onClick={() => handleEditNote(note)}><IconEdit size={18} /></ActionIcon>
                        <ActionIcon color="red" onClick={() => handleDeleteNote(note.id)}><IconTrash size={18} /></ActionIcon>
                      </Group>
                    </Group>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default NotesTool;
