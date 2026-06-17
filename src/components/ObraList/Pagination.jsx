import { useLanguage } from '../../i18n/LanguageContext';

function Pagination({
  currentPage,
  totalPages,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage
}) {
  const { t } = useLanguage();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={onFirstPage}
        disabled={currentPage === 1}
        title={t('pagination_first')}
      >
        «
      </button>
      <button
        className="pagination-btn"
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        title={t('pagination_prev')}
      >
        ‹
      </button>

      <div className="pagination-info">
        {t('pagination_page').replace('{current}', currentPage).replace('{total}', totalPages)}
      </div>

      <button
        className="pagination-btn"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        title={t('pagination_next')}
      >
        ›
      </button>
      <button
        className="pagination-btn"
        onClick={onLastPage}
        disabled={currentPage === totalPages}
        title={t('pagination_last')}
      >
        »
      </button>
    </div>
  );
}

export default Pagination;
