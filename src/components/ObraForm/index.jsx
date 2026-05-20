import { useState } from 'react';
import { useObraForm } from './hooks/useObraForm';
import BasicInfoSection from './sections/BasicInfoSection';
import StatusSection from './sections/StatusSection';
import ReleaseScheduleSection from './sections/ReleaseScheduleSection';
import GenresSection from './sections/GenresSection';
import RatingSection from './sections/RatingSection';
import LinksSection from './sections/LinksSection';
import CoversSection from './sections/CoversSection';
import NotesSection from './sections/NotesSection';
import SearchModal from './components/SearchModal';
import { convertAniListToObra } from '../../services/anilistService';
import { convertMangaDexToObra } from '../../services/mangadexService';
import './ObraForm.css';

/**
 * Main ObraForm component
 * Orchestrates all form sections and handles submission
 *
 * This component has been refactored from a 1018-line monolith into:
 * - 8 section components (each focused on specific functionality)
 * - 4 custom hooks (form state, covers, links, migration)
 * - 2 reusable components (DaySelector, GenreCheckbox)
 * - 2 utility modules (validation, data processing)
 *
 * All functionality is preserved including:
 * - Multi-cover system with principal selection
 * - Multi-link system with principal selection
 * - Release schedule variations (weekly/biweekly/monthly/irregular)
 * - Data migration (v1.0 → v1.2 compatibility)
 * - Form validation
 * - File upload with preview
 */
function ObraForm({ obra, config, onSave, onCancel }) {
  const {
    formData,
    errors,
    handleChange,
    handleNumberChange,
    handleNumberBlur,
    handleGeneroToggle,
    handleDiaLancamentoToggle,
    handleSubmit,
    capasManager,
    linksManager
  } = useObraForm(obra, onSave);

  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleOpenSearch = () => {
    setShowSearchModal(true);
  };

  const handleMangaSelect = (manga) => {
    // Convert based on source
    const obraData = manga._source === 'mangadex'
      ? convertMangaDexToObra(manga)
      : convertAniListToObra(manga);

    // Auto-fill all available fields
    Object.entries(obraData).forEach(([key, value]) => {
      if (!key.startsWith('_')) {
        handleChange(key, value);
      }
    });

    // Store cover URL for potential later use
    if (obraData._coverUrl) {
      console.log(`Cover URL available (${obraData._source || 'anilist'}):`, obraData._coverUrl);
    }
  };

  return (
    <div className="obra-form-container">
      <h2>{obra ? 'Editar Obra' : 'Adicionar Nova Obra'}</h2>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="form-errors">
          <h4>Erros de validação:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="obra-form">
        {/* Basic Information */}
        <BasicInfoSection
          formData={formData}
          onChange={handleChange}
          onSearchClick={handleOpenSearch}
        />

        {/* Status and Progress */}
        <StatusSection
          formData={formData}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onNumberBlur={handleNumberBlur}
          statusObraList={config?.statusObra}
          statusLeituraList={config?.statusLeitura}
        />

        {/* Release Schedule (hidden if complete/cancelled) */}
        <ReleaseScheduleSection
          formData={formData}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onNumberBlur={handleNumberBlur}
          onDayToggle={handleDiaLancamentoToggle}
          statusObraList={config?.statusObra}
          tipoLancamentoList={config?.tipoLancamento}
        />

        {/* Genres */}
        <GenresSection
          formData={formData}
          onGenreToggle={handleGeneroToggle}
          generosList={config?.generos}
        />

        {/* Rating */}
        <RatingSection
          formData={formData}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          onNumberBlur={handleNumberBlur}
        />

        {/* Links */}
        <LinksSection
          formData={formData}
          onChange={handleChange}
          linksManager={linksManager}
        />

        {/* Covers */}
        <CoversSection capasManager={capasManager} />

        {/* Notes */}
        <NotesSection
          formData={formData}
          onChange={handleChange}
        />

        {/* Action buttons */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {obra ? 'Salvar Alterações' : 'Adicionar Obra'}
          </button>
        </div>
      </form>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleMangaSelect}
        initialSearch={formData.nome}
      />
    </div>
  );
}

export default ObraForm;
