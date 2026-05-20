/**
 * NotesSection - User notes display
 * Shows the user's personal notes about the work
 */
function NotesSection({ notas }) {
  if (!notas) return null;

  return (
    <section className="detail-section">
      <h3>Minhas Anotações</h3>
      <div className="notes-content">
        {notas}
      </div>
    </section>
  );
}

export default NotesSection;
