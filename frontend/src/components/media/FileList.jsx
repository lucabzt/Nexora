import React, { useState } from 'react';
import { List, Group, Text, Button, Paper, Box } from '@mantine/core';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Loader } from '@mantine/core';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export function FileList({ 
  files, 
  onDelete, 
  deletingItem, 
  mediaLoading 
}) {
  const { t } = useTranslation(['chapterView', 'common']);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (file) => {
    setItemToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  if (mediaLoading && files.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Loader size="md" />
      </Box>
    );
  }

  if (files.length === 0) {
    return <Text color="dimmed" align="center">{t('noFiles')}</Text>;
  }

  return (
    <>
      <ConfirmDeleteModal
        opened={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('common:confirmDelete.title')}
        message={itemToDelete ? t('common:file.deleteConfirm', { filename: itemToDelete.filename }) : ''}
        confirmLabel={t('common:confirmDelete.confirm')}
        cancelLabel={t('common:confirmDelete.cancel')}
        loading={!!deletingItem}
      />
      <Box sx={{ 
        '& .mantine-List-itemWrapper': {
          width: '100% !important'
        }
      }}>
      <List spacing="md" size="md">
        {files.map((file) => (
          <List.Item key={file.id}>
            <Group spacing="sm">
              {file.loading ? (
                <Loader size="xs" />
              ) : file.error ? (
                <Text color="red" size="sm">{file.error}</Text>
              ) : (
                <>
                  <Group position="apart" style={{ width: '100%' }}>
                    <a 
                      href={file.objectUrl} 
                      download={file.filename}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDownload size={16} />
                      {file.filename}
                    </a>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(file);
                      }}
                      loading={deletingItem === `file-${file.id}`}
                      disabled={!!deletingItem}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                  {file.content_type === 'application/pdf' && file.objectUrl && (
                    <Paper 
                      withBorder 
                      radius="md" 
                      mt="sm" 
                      style={{ 
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '1rem 0'
                      }}
                    >
                      <iframe 
                        src={`${file.objectUrl}#toolbar=0&view=FitH`} 
                        style={{ 
                          width: '85%', 
                          height: '1200px', 
                          border: 'none',
                          backgroundColor: '#f8f9fa',
                          display: 'block'
                        }} 
                        title={file.filename} 
                      />
                    </Paper>
                  )}
                </>
              )}
            </Group>
          </List.Item>
        ))}
      </List>
    </Box>
    </>
  );
}

export default FileList;
