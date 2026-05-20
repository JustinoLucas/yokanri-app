/**
 * ProgressSection - Reading progress with stats and bar
 * Displays current chapter, user chapter, and visual progress bar
 */
function ProgressSection({ obra }) {
  const progressPercentage = obra.capituloAtual > 0
    ? Math.round((obra.capituloAtualUsuario / obra.capituloAtual) * 100)
    : 0;

  return (
    <section className="detail-section">
      <h3>Progresso de Leitura</h3>
      <div className="progress-info">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Capítulo Atual:</span>
            <span className="stat-value">{obra.capituloAtual}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Meu Capítulo:</span>
            <span className="stat-value">{obra.capituloAtualUsuario}</span>
          </div>
        </div>

        {obra.capituloAtual > 0 && (
          <div className="progress-bar-container">
            <div className="progress-bar-large">
              <div
                className="progress-fill"
                style={{
                  width: `${progressPercentage}%`
                }}
              />
            </div>
            <span className="progress-percentage">
              {progressPercentage}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProgressSection;
