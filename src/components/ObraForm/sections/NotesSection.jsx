import { useLanguage } from '../../../i18n/LanguageContext';

function NotesSection({ formData, onChange }) {
  const { t } = useLanguage();

  return (
    <section className="form-section">
      <h3>{t('form_section_notes')}</h3>

      <div className="form-group">
        <textarea
          value={formData.notas}
          onChange={(e) => onChange('notas', e.target.value)}
          placeholder={t('form_notes_ph')}
          rows="5"
        />
      </div>
    </section>
  );
}

export default NotesSection;
