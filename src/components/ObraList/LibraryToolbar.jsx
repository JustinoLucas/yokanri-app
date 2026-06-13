import './LibraryToolbar.css';

/**
 * LibraryToolbar V3F — 52px abaixo do topbar
 *
 * Props:
 *   eyebrow        — texto superior (ex: "BIBLIOTECA", "RESULTADOS")
 *   title          — título principal (ex: "Lendo · 23 obras")
 *   filterPanelOpen — boolean, aplica o tint de "filtros ativos"
 */
function LibraryToolbar({
  eyebrow = 'Biblioteca',
  title = 'Obras',
  filterPanelOpen = false,
}) {
  return (
    <div className={`lib-toolbar ${filterPanelOpen ? 'lib-toolbar--filters-open' : ''}`}>
      {/* Título contextual */}
      <div className="lib-toolbar-title-block">
        <span className="lib-toolbar-eyebrow">{eyebrow.toUpperCase()}</span>
        <span className="lib-toolbar-title">{title}</span>
      </div>
    </div>
  );
}

export default LibraryToolbar;
