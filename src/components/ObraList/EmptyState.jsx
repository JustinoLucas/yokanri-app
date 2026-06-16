import { useLanguage } from '../../i18n/LanguageContext';

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="empty-state">
      <p>{t('library_no_results')}</p>
      <p>{t('library_no_results_hint')}</p>
    </div>
  );
}

export default EmptyState;
