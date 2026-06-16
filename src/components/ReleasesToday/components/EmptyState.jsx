import { useLanguage } from '../../../i18n/LanguageContext';

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="no-releases">
      {t('releases_empty')}
    </div>
  );
}

export default EmptyState;
