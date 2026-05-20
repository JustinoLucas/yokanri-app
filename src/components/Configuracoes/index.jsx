import { useState } from 'react';
import { Pencil, Trash2, Check, X, Plus, Lock } from 'lucide-react';
import './Configuracoes.css';

const TABS = [
  { id: 'statusObra', label: 'Status da Obra', hasColor: true, hasHideSchedule: true },
  { id: 'statusLeitura', label: 'Meu Status', hasColor: true, hasHideSchedule: false },
  { id: 'tipoLancamento', label: 'Tipo de Lançamento', hasColor: false, hasHideSchedule: false, readonly: true },
  { id: 'generos', label: 'Gêneros', hasColor: false, hasHideSchedule: false },
];

const CATEGORY_TO_OBRA_FIELD = {
  statusObra: 'status',
  statusLeitura: 'statusUsuario',
  tipoLancamento: 'tipoLancamento',
  generos: 'generos',
};

function countAffected(obras, category, label) {
  const field = CATEGORY_TO_OBRA_FIELD[category];
  if (!obras || !field) return 0;
  return obras.filter(obra => {
    if (category === 'generos') return Array.isArray(obra.generos) && obra.generos.includes(label);
    return obra[field] === label;
  }).length;
}

function ConfigItem({ item, hasColor, hasHideSchedule, readonly, onRename, onDelete, onUpdateColor, onToggleHideSchedule }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const [editError, setEditError] = useState('');

  const handleConfirmEdit = async () => {
    if (!editValue.trim() || editValue.trim() === item.label) {
      setEditing(false);
      return;
    }
    const result = await onRename(item.id, editValue.trim());
    if (result === 'duplicate') {
      setEditError(`"${editValue.trim()}" já existe.`);
      return;
    }
    setEditing(false);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditValue(item.label);
    setEditing(false);
    setEditError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirmEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  return (
    <div className={`config-item${editing ? ' editing' : ''}`}>
      {hasColor && (
        <div className="config-item-color">
          <input
            type="color"
            value={item.color || '#888888'}
            onChange={e => onUpdateColor(item.id, e.target.value)}
            title="Escolher cor"
            disabled={item.protected}
          />
        </div>
      )}

      {editing ? (
        <div className="config-item-edit-wrapper">
          <input
            className="config-item-input"
            value={editValue}
            onChange={e => { setEditValue(e.target.value); setEditError(''); }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {editError && <span className="config-item-error">{editError}</span>}
        </div>
      ) : (
        <span className="config-item-label">{item.label}</span>
      )}

      {hasHideSchedule && (
        <label className="config-item-toggle" title="Ocultar seção de padrão de lançamento para este status">
          <input
            type="checkbox"
            checked={!!item.hideSchedule}
            onChange={() => onToggleHideSchedule(item.id)}
            disabled={item.protected}
          />
          <span>oculta lançamento</span>
        </label>
      )}

      {(item.protected || readonly) ? (
        <div className="config-item-protected">
          <Lock size={12} />
          fixo
        </div>
      ) : (
        <div className="config-item-actions">
          {editing ? (
            <>
              <button className="config-btn confirm" onClick={handleConfirmEdit} title="Confirmar">
                <Check size={14} />
              </button>
              <button className="config-btn" onClick={handleCancelEdit} title="Cancelar">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button className="config-btn" onClick={() => { setEditValue(item.label); setEditing(true); }} title="Renomear">
                <Pencil size={14} />
              </button>
              <button className="config-btn danger" onClick={() => onDelete(item.id, item.label)} title="Excluir">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Configuracoes({ config, obras, onAdd, onRename, onDelete, onUpdateColor, onToggleHideSchedule }) {
  const [activeTab, setActiveTab] = useState('statusObra');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemColor, setNewItemColor] = useState('#888888');
  const [addError, setAddError] = useState('');

  if (!config) return <div className="config-loading">Carregando configurações...</div>;

  const activeTabDef = TABS.find(t => t.id === activeTab);
  const items = config[activeTab] || [];
  const isReadonly = !!activeTabDef?.readonly;

  const handleAdd = async () => {
    if (!newItemValue.trim()) return;
    const result = await onAdd(activeTab, newItemValue.trim(), newItemColor);
    if (result === 'duplicate') {
      setAddError(`"${newItemValue.trim()}" já existe nesta lista.`);
      return;
    }
    setNewItemValue('');
    setNewItemColor('#888888');
    setAddError('');
  };

  const handleNewKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleDelete = (id, label) => {
    const affected = countAffected(obras, activeTab, label);
    let msg = `Excluir "${label}"?`;
    if (activeTab === 'generos' && affected > 0) {
      msg += `\n\nEste gênero será removido de ${affected} obra(s).`;
    } else if (activeTab !== 'generos' && affected > 0) {
      msg += `\n\n${affected} obra(s) com este valor serão redefinidas como "Não definido".`;
    }
    if (confirm(msg)) onDelete(activeTab, id);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setNewItemValue('');
    setNewItemColor('#888888');
    setAddError('');
  };

  return (
    <div className="configuracoes">
      <div className="configuracoes-header">
        <h2>Configurações</h2>
        <p>Gerencie os valores disponíveis nos formulários de obra.</p>
      </div>

      <div className="config-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`config-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="config-list">
        {items.length === 0 ? (
          <div className="config-empty">Nenhum item cadastrado.</div>
        ) : (
          items.map(item => (
            <ConfigItem
              key={item.id}
              item={item}
              hasColor={activeTabDef?.hasColor}
              hasHideSchedule={activeTabDef?.hasHideSchedule}
              readonly={isReadonly}
              onRename={(id, newLabel) => onRename(activeTab, id, newLabel)}
              onDelete={handleDelete}
              onUpdateColor={(id, color) => onUpdateColor(activeTab, id, color)}
              onToggleHideSchedule={onToggleHideSchedule}
            />
          ))
        )}
      </div>

      {isReadonly && (
        <p className="config-readonly-note">Os tipos de lançamento são gerenciados pelo sistema e não podem ser alterados.</p>
      )}

      {!isReadonly && (
        <div className="config-add-section">
          <div className="config-add-row">
            {activeTabDef?.hasColor && (
              <input
                type="color"
                className="config-add-color"
                value={newItemColor}
                onChange={e => setNewItemColor(e.target.value)}
                title="Cor do novo item"
              />
            )}
            <input
              className="config-add-input"
              placeholder="Novo item..."
              value={newItemValue}
              onChange={e => { setNewItemValue(e.target.value); setAddError(''); }}
              onKeyDown={handleNewKeyDown}
            />
            <button
              className="config-add-btn"
              onClick={handleAdd}
              disabled={!newItemValue.trim()}
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>
          {addError && <span className="config-add-error">{addError}</span>}
        </div>
      )}
    </div>
  );
}

export default Configuracoes;
