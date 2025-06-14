import React, { useState } from 'react';
import { SimpleGrid, Card, Image, Text, Group, Button, Box } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Loader } from '@mantine/core';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export function MediaGallery({ 
  images, 
  onDelete, 
  deletingItem, 
  isMobile 
}) {
  const { t } = useTranslation(['chapterView', 'common']);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (image) => {
    setItemToDelete(image);
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

  if (images.length === 0) {
    return (
      <Text color="dimmed" align="center">
        {t('noImages')}
      </Text>
    );
  }

  return (
    <>
      <ConfirmDeleteModal
        opened={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('common:confirmDelete.title')}
        message={t('common:image.deleteConfirm')}
        confirmLabel={t('common:confirmDelete.confirm')}
        cancelLabel={t('common:confirmDelete.cancel')}
        loading={!!deletingItem}
      />
      <SimpleGrid cols={isMobile ? 1 : 3} spacing="md">
      {images.map((image) => (
        <Card key={image.id} shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section>
            {image.loading ? (
              <Box style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size="sm" />
              </Box>
            ) : image.error ? (
              <Box style={{ 
                height: 160, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#f8f9fa' 
              }}>
                <Text color="red" align="center">{image.error}</Text>
              </Box>
            ) : (
              <Image
                src={image.objectUrl}
                height={160}
                alt={image.filename}
                fit="contain"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            )}
          </Card.Section>
          <Group position="apart" mt="md">
            <Text weight={500} lineClamp={1} title={image.filename} style={{ flex: 1 }}>
              {image.filename}
            </Text>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(image);
              }}
              loading={deletingItem === `image-${image.id}`}
              disabled={!!deletingItem}
            >
              <IconTrash size={16} />
            </Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
    </>
  );
}

export default MediaGallery;
