/**
 * Notes section
 * Personal notes textarea
 */
function NotesSection({ formData, onChange }) {
  return (
    <section className="form-section">
      <h3>Anotações Pessoais</h3>

      <div className="form-group">
        <textarea
          value={formData.notas}
          onChange={(e) => onChange('notas', e.target.value)}
          placeholder="Suas anotações, comentários, etc..."
          rows="5"
        />
      </div>
    </section>
  );
}

export default NotesSection;
