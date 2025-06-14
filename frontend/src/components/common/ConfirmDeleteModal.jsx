import React from 'react';
import { Modal, Text, Button, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function ConfirmDeleteModal({ 
  opened, 
  onClose, 
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false
}) {
  const { t } = useTranslation('common');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title || t('confirmDelete.title', 'Delete Item')}
      centered
      overlayProps={{
        blur: 3,
      }}
    >
      <Text size="sm" mb="xl">
        {message || t('confirmDelete.message', 'Are you sure you want to delete this item? This action cannot be undone.')}
      </Text>
      <Group position="right">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {cancelLabel || t('confirmDelete.cancel', 'Cancel')}
        </Button>
        <Button 
          color="red" 
          onClick={onConfirm} 
          loading={loading}
        >
          {confirmLabel || t('confirmDelete.confirm', 'Delete')}
        </Button>
      </Group>
    </Modal>
  );
}

export default ConfirmDeleteModal;
