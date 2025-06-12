import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n, t } = useTranslation('language');

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={changeLanguage}
      data={[
        { value: 'en', label: t('english') },
        { value: 'de', label: t('german') },
      ]}
      size="xs"
      w={100}
    />
  );
}

export default LanguageSelector;


