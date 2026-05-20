import { useState, useEffect } from 'react';
import { validateObra } from '../../../types/obra';
import { useMigration } from './useMigration'; // ⚠️ REMOVER NA v4.0
import { useCapasManager } from './useCapasManager';
import { useLinksManager } from './useLinksManager';
import { calculateStatusDateUpdates } from '../../../utils/statusDateHelpers';
import { useConfig } from '../../../context/ConfigContext';

/**
 * Main form hook that orchestrates form state and validation
 * @param {Object} obra - The obra to edit (or null for new obra)
 * @param {Function} onSave - Callback when form is saved
 */
export const useObraForm = (obra, onSave) => {
  const config = useConfig();
  // ⚠️ REMOVER NA v4.0 - Migração apenas para dados antigos
  const { migrateObraData } = useMigration();
  const [formData, setFormData] = useState(() => migrateObraData(obra));
  // ⚠️ NA v4.0 substituir por: const [formData, setFormData] = useState(() => obra || createEmptyObra());
  const [errors, setErrors] = useState([]);

  // Separate managers for covers and links
  const capasManager = useCapasManager(obra);
  const linksManager = useLinksManager(obra);

  useEffect(() => {
    if (obra) {
      const migrated = migrateObraData(obra);
      setFormData(migrated);
    }
  }, [obra]);

  /**
   * Generic change handler for form fields
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      dataAtualizado: new Date().toISOString()
    }));
  };

  /**
   * Number input change handler with better UX
   * Allows empty string (empty field) during typing
   * @param {string} field - Field name
   * @param {string} value - Input value
   */
  const handleNumberChange = (field, value) => {
    // Allow empty string (empty field)
    if (value === '') {
      handleChange(field, '');
      return;
    }

    // Convert to number
    const num = parseFloat(value);
    if (!isNaN(num)) {
      handleChange(field, num);
    }
  };

  /**
   * Number input blur handler
   * Applies min/max constraints and default value on blur
   * @param {string} field - Field name
   * @param {string|number} value - Input value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} defaultValue - Default value if empty/invalid
   */
  const handleNumberBlur = (field, value, min, max, defaultValue = 0) => {
    // If empty or invalid, use default value
    if (value === '' || isNaN(value)) {
      handleChange(field, defaultValue);
      return;
    }

    // Apply min/max
    let num = parseFloat(value);
    if (min !== null && num < min) num = min;
    if (max !== null && num > max) num = max;

    handleChange(field, num);
  };

  /**
   * Toggle handler for genre selection
   * @param {string} genero - Genre to toggle
   */
  const handleGeneroToggle = (genero) => {
    const current = formData.generos || [];
    const updated = current.includes(genero)
      ? current.filter(g => g !== genero)
      : [...current, genero];
    handleChange('generos', updated);
  };

  /**
   * Toggle handler for day selection
   * @param {string} dia - Day to toggle
   */
  const handleDiaLancamentoToggle = (dia) => {
    const current = formData.diasLancamento || [];
    const updated = current.includes(dia)
      ? current.filter(d => d !== dia)
      : [...current, dia];
    handleChange('diasLancamento', updated);
  };

  /**
   * Form submission handler
   * @param {Event} e - Submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const validationErrors = validateObra(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    let finalData = { ...formData };

    try {
      // Check if status changed and apply date updates
      const find = (id) => config?.statusLeitura?.find(s => s.id === id)?.label;
      const labelLendo = find('lendo') ?? 'Lendo';
      const labelCompleto = find('completo') ?? 'Completo';

      if (obra && formData.statusUsuario !== obra.statusUsuario) {
        const dateUpdates = calculateStatusDateUpdates(
          obra,
          formData.statusUsuario,
          obra.statusUsuario,
          config
        );
        finalData = { ...finalData, ...dateUpdates };
      }
      else if (!obra && formData.statusUsuario === labelLendo && !formData.dataInicioLeitura) {
        finalData.dataInicioLeitura = new Date().toISOString();
      } else if (!obra && formData.statusUsuario === labelCompleto) {
        if (!formData.dataInicioLeitura) {
          finalData.dataInicioLeitura = new Date().toISOString();
        }
        if (!formData.dataFimLeitura) {
          finalData.dataFimLeitura = new Date().toISOString();
        }
      }

      // Save covers
      const savedCapas = await capasManager.saveCapas(formData.id);
      finalData.capas = savedCapas;

      // Save links
      finalData.links = linksManager.getValidLinks();

      onSave(finalData);
    } catch (error) {
      alert('Erro ao salvar obra. Verifique os dados e tente novamente.');
      console.error('Save error:', error);
    }
  };

  return {
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
  };
};

export default useObraForm;
