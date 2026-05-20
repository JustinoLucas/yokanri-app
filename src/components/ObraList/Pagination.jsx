function Pagination({
  currentPage,
  totalPages,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={onFirstPage}
        disabled={currentPage === 1}
        title="Primeira página"
      >
        «
      </button>
      <button
        className="pagination-btn"
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        ‹
      </button>

      <div className="pagination-info">
        Página {currentPage} de {totalPages}
      </div>

      <button
        className="pagination-btn"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        title="Próxima página"
      >
        ›
      </button>
      <button
        className="pagination-btn"
        onClick={onLastPage}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        »
      </button>
    </div>
  );
}

export default Pagination;
