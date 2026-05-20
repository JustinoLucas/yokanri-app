import { Edit2, Trash2 } from 'lucide-react';

/**
 * DetailHeader - Title, subtitle, and action buttons (edit/delete)
 * Displays the work's name, alternative name, and control buttons
 */
function DetailHeader({ obra, onEdit, onDelete }) {
  return (
    <>
      <div className="detail-header">
        <h1 className="detail-title">{obra.nome}</h1>
        <div className="detail-actions">
          <button className="btn-icon" onClick={onEdit} title="Editar">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon btn-delete-icon" onClick={onDelete} title="Excluir">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {obra.nomeAlternativo && (
        <h2 className="detail-alt-title">{obra.nomeAlternativo}</h2>
      )}
    </>
  );
}

export default DetailHeader;
