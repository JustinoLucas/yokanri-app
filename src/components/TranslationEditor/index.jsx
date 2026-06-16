import { useState, useMemo, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, Save, Search, Plus, Trash2, Globe, Check, AlertCircle } from 'lucide-react';
import stringsData from '../../i18n/strings.json';
import languagesData from '../../i18n/languages.json';
import './TranslationEditor.css';

// ─── Mapeamento de seções ────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'idiomas',    label: 'Idiomas',        type: 'languages' },
  { id: 'lang_names', label: 'Nomes de Idiomas', type: 'lang_names' },
  { id: 'geral',      label: 'Geral',           exactKeys: ['loading','back','cancel','save','add','edit','delete','confirm','close','search','yes','no','error','success'] },
  { id: 'sidebar',    label: 'Sidebar',         prefix: 'sidebar_' },
  { id: 'topbar',     label: 'Topbar',          prefix: 'topbar_' },
  { id: 'biblioteca', label: 'Biblioteca',      prefixes: ['library_', 'colpicker_'] },
  { id: 'adicao',     label: 'Página Adição',   prefix: 'form_' },
  { id: 'obra',       label: 'Página da Obra',  prefix: 'detail_' },
  { id: 'opcoes',     label: 'Opções',          prefix: 'config_' },
  { id: 'stats',      label: 'Estatísticas',    prefix: 'stats_' },
  { id: 'cards',      label: 'Cards',           prefix: 'card_' },
  { id: 'agenda',     label: 'Agenda',          prefix: 'releases_' },
  { id: 'calendario', label: 'Calendário',      prefix: 'calendar_' },
  { id: 'perfil',     label: 'Meu Perfil',      prefix: 'profile_' },
  { id: 'busca',      label: 'Busca Online',    prefix: 'search_' },
  { id: 'colecoes',   label: 'Coleções',        prefix: 'collection_' },
];

function getSectionKeys(section, allKeys) {
  if (section.exactKeys) return section.exactKeys.filter(k => allKeys.includes(k));
  const prefixes = section.prefixes ?? (section.prefix ? [section.prefix] : []);
  return allKeys.filter(k => prefixes.some(p => k.startsWith(p)));
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function TranslationEditor({ onClose }) {
  const [strings, setStrings]   = useState(() => JSON.parse(JSON.stringify(stringsData)));
  const [langs, setLangs]       = useState(() => JSON.parse(JSON.stringify(languagesData)));
  const [activeSection, setActiveSection] = useState('geral');
  const [filter, setFilter]     = useState('');
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveOk, setSaveOk]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const filterRef = useRef(null);

  // Todas as chaves vêm do pt-BR (idioma de referência)
  const allKeys = useMemo(() => Object.keys(strings['pt-BR'] ?? {}), [strings]);

  const section = SECTIONS.find(s => s.id === activeSection);
  const sectionKeys = useMemo(() => {
    if (section?.type === 'languages') return [];
    if (section?.type === 'lang_names') return langs.map(l => `lang_name_${l.code}`);
    return getSectionKeys(section ?? {}, allKeys);
  }, [section, allKeys, langs]);

  const visibleKeys = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sectionKeys;
    return sectionKeys.filter(k =>
      k.includes(q) || langs.some(l => (strings[l.code]?.[k] ?? '').toLowerCase().includes(q))
    );
  }, [sectionKeys, filter, strings, langs]);

  function updateKey(langCode, key, value) {
    setStrings(prev => ({
      ...prev,
      [langCode]: { ...prev[langCode], [key]: value },
    }));
    setDirty(true);
    setSaveOk(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr('');
    try {
      await invoke('save_translations', {
        stringsJson:   JSON.stringify(strings, null, 2),
        languagesJson: JSON.stringify(langs,   null, 2),
      });
      setDirty(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } catch (e) {
      setSaveErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (dirty && !confirm('Há alterações não salvas. Fechar mesmo assim?')) return;
    onClose();
  }

  return (
    <div className="te-overlay">
      <div className="te-shell">

        {/* ── Barra superior ──────────────────────────────── */}
        <header className="te-header">
          <div className="te-header-left">
            <Globe size={16} className="te-logo" />
            <span className="te-header-title">Editor de Traduções</span>
            {dirty && <span className="te-dirty-badge">não salvo</span>}
          </div>
          <div className="te-header-right">
            {saveErr && (
              <span className="te-save-error">
                <AlertCircle size={13} /> {saveErr}
              </span>
            )}
            {saveOk && (
              <span className="te-save-ok">
                <Check size={13} /> Salvo!
              </span>
            )}
            <button
              className="te-btn te-btn-save"
              onClick={handleSave}
              disabled={!dirty || saving}
            >
              <Save size={13} />
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button className="te-btn te-btn-close" onClick={handleClose}>
              <X size={14} />
            </button>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="te-body">

          {/* Nav lateral */}
          <nav className="te-nav">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`te-nav-item${activeSection === s.id ? ' te-nav-item--active' : ''}`}
                onClick={() => { setActiveSection(s.id); setFilter(''); }}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Conteúdo */}
          <div className="te-content">
            {section?.type === 'languages' ? (
            <LanguagesPage
                langs={langs}
                strings={strings}
                setLangs={setLangs}
                setStrings={setStrings}
                setDirty={setDirty}
              />
            ) : (
              <>
                {/* Subheader com filtro e legenda */}
                <div className="te-content-header">
                  <div className="te-search-wrap">
                    <Search size={13} className="te-search-icon" />
                    <input
                      ref={filterRef}
                      className="te-search"
                      placeholder="Filtrar chaves ou traduções…"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                    />
                  </div>
                  <div className="te-lang-chips">
                    {langs.map(l => (
                      <span key={l.code} className="te-lang-chip">
                        {l.flag} {l.code}
                      </span>
                    ))}
                  </div>
                  <span className="te-count">{visibleKeys.length} chaves</span>
                </div>

                {/* Tabela de chaves */}
                <div className="te-table">
                  <div className="te-table-head">
                    <span className="te-col-key">Chave</span>
                    {langs.map(l => (
                      <span key={l.code} className="te-col-val">
                        {l.flag} {l.label}
                      </span>
                    ))}
                  </div>
                  <div className="te-table-body">
                    {visibleKeys.length === 0 ? (
                      <div className="te-empty">Nenhuma chave encontrada.</div>
                    ) : (
                      visibleKeys.map(key => (
                        <KeyRow
                          key={key}
                          keyName={key}
                          langs={langs}
                          strings={strings}
                          onUpdate={updateKey}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Linha de chave ──────────────────────────────────────────────────────────

function KeyRow({ keyName, langs, strings, onUpdate }) {
  const hasEmpty = langs.some(l => !(strings[l.code]?.[keyName]));
  const isMultiline = langs.some(l => (strings[l.code]?.[keyName] ?? '').includes('\n'));

  return (
    <div className={`te-row${hasEmpty ? ' te-row--missing' : ''}`}>
      <span className="te-row-key" title={keyName}>{keyName}</span>
      {langs.map(l => {
        const val = strings[l.code]?.[keyName] ?? '';
        return (
          <div key={l.code} className="te-row-val">
            {isMultiline ? (
              <textarea
                className="te-input te-input--multi"
                value={val}
                onChange={e => onUpdate(l.code, keyName, e.target.value)}
                rows={2}
              />
            ) : (
              <input
                className={`te-input${!val ? ' te-input--empty' : ''}`}
                value={val}
                onChange={e => onUpdate(l.code, keyName, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal de confirmação dupla — exclusão de idioma ────────────────────────

function DeleteLangModal({ lang, onConfirm, onCancel }) {
  const [step, setStep]       = useState(1); // 1 = aviso, 2 = digitar código
  const [typed, setTyped]     = useState('');
  const confirmed = typed.trim() === lang.code;

  return (
    <div className="te-modal-overlay" onClick={onCancel}>
      <div className="te-modal" onClick={e => e.stopPropagation()}>

        {step === 1 ? (
          <>
            <div className="te-modal-header">
              <Trash2 size={16} className="te-modal-icon--danger" />
              <h3>Excluir idioma</h3>
            </div>
            <div className="te-modal-body">
              <p>
                Você está prestes a excluir o idioma{' '}
                <strong>{lang.flag} {lang.label}</strong> (<code>{lang.code}</code>).
              </p>
              <p className="te-modal-warning">
                Todas as traduções deste idioma serão removidas permanentemente do <code>strings.json</code>.
              </p>
            </div>
            <div className="te-modal-footer">
              <button className="te-btn" onClick={onCancel}>Cancelar</button>
              <button className="te-btn te-btn-danger" onClick={() => setStep(2)}>
                Continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="te-modal-header">
              <AlertCircle size={16} className="te-modal-icon--danger" />
              <h3>Confirmação final</h3>
            </div>
            <div className="te-modal-body">
              <p>
                Digite o código <code>{lang.code}</code> para confirmar a exclusão:
              </p>
              <input
                className="te-input te-modal-confirm-input"
                placeholder={lang.code}
                value={typed}
                onChange={e => setTyped(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmed && onConfirm()}
                autoFocus
              />
            </div>
            <div className="te-modal-footer">
              <button className="te-btn" onClick={() => { setStep(1); setTyped(''); }}>
                Voltar
              </button>
              <button
                className="te-btn te-btn-danger"
                disabled={!confirmed}
                onClick={onConfirm}
              >
                Excluir permanentemente
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─── Página de Idiomas ───────────────────────────────────────────────────────

function LanguagesPage({ langs, strings, setLangs, setStrings, setDirty }) {
  const [editIdx, setEditIdx]       = useState(null);
  const [editBuf, setEditBuf]       = useState({});
  const [adding, setAdding]         = useState(false);
  const [newLang, setNewLang]       = useState({ code: '', flag: '', native: '', label: '' });
  const [deleteTarget, setDeleteTarget] = useState(null); // { idx, lang }

  function startEdit(idx) {
    setEditIdx(idx);
    setEditBuf({ ...langs[idx] });
  }

  function confirmEdit() {
    if (!editBuf.code?.trim()) return;
    const oldCode = langs[editIdx].code;
    const newCode = editBuf.code.trim();

    setLangs(prev => prev.map((l, i) => i === editIdx ? { ...editBuf } : l));

    if (oldCode !== newCode) {
      setStrings(prev => {
        const next = { ...prev };
        next[newCode] = next[oldCode] ?? {};
        delete next[oldCode];
        return next;
      });
    }
    setDirty(true);
    setEditIdx(null);
  }

  function requestDelete(idx) {
    const lang = langs[idx];
    if (lang.code === 'pt-BR') { alert('O idioma base (pt-BR) não pode ser removido.'); return; }
    setDeleteTarget({ idx, lang });
  }

  function confirmDelete() {
    const { idx, lang } = deleteTarget;
    setLangs(prev => prev.filter((_, i) => i !== idx));
    setStrings(prev => {
      const next = { ...prev };
      delete next[lang.code];
      return next;
    });
    setDirty(true);
    setDeleteTarget(null);
  }

  function confirmAdd() {
    const code = newLang.code.trim();
    if (!code) return;
    if (langs.some(l => l.code === code)) { alert(`O código "${code}" já existe.`); return; }

    const label = newLang.label.trim() || code;

    setLangs(prev => [...prev, { ...newLang, code, label }]);
    setStrings(prev => {
      const next = { ...prev };
      // Bloco vazio para o novo idioma
      next[code] = {};
      // Adiciona lang_name_<newCode> em todos os idiomas existentes (vazio para preencher)
      Object.keys(next).forEach(langCode => {
        if (langCode !== code) {
          next[langCode] = { ...next[langCode], [`lang_name_${code}`]: '' };
        }
      });
      // Adiciona lang_name_<existingCode> no novo idioma (também vazio para preencher)
      langs.forEach(l => {
        next[code][`lang_name_${l.code}`] = '';
      });
      // E o próprio nome do novo idioma nele mesmo
      next[code][`lang_name_${code}`] = label;
      return next;
    });
    setDirty(true);
    setAdding(false);
    setNewLang({ code: '', flag: '', native: '', label: '' });
  }

  return (
    <div className="te-langs-page">
      <h2 className="te-langs-title">Idiomas</h2>
      <p className="te-langs-desc">
        Gerencie os idiomas disponíveis no app. O idioma base <code>pt-BR</code> não pode ser removido.
      </p>

      <table className="te-langs-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Original (nativo)</th>
            <th>Código</th>
            <th>Flag</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {langs.map((lang, idx) => (
            <tr key={lang.code}>
              {editIdx === idx ? (
                <>
                  <td><input className="te-input" value={editBuf.label}  onChange={e => setEditBuf(b => ({...b, label:  e.target.value}))} /></td>
                  <td><input className="te-input" value={editBuf.native} onChange={e => setEditBuf(b => ({...b, native: e.target.value}))} /></td>
                  <td><input className="te-input te-input--code" value={editBuf.code}   onChange={e => setEditBuf(b => ({...b, code:   e.target.value}))} /></td>
                  <td><input className="te-input te-input--flag" value={editBuf.flag}   onChange={e => setEditBuf(b => ({...b, flag:   e.target.value}))} /></td>
                  <td className="te-langs-actions">
                    <button className="te-btn-sm te-btn-sm--confirm" onClick={confirmEdit}><Check size={12} /></button>
                    <button className="te-btn-sm" onClick={() => setEditIdx(null)}><X size={12} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td>{lang.label}</td>
                  <td>{lang.native}</td>
                  <td><code>{lang.code}</code></td>
                  <td>{lang.flag}</td>
                  <td className="te-langs-actions">
                    <button className="te-btn-sm" onClick={() => startEdit(idx)}>Editar</button>
                    {lang.code !== 'pt-BR' && (
                      <button className="te-btn-sm te-btn-sm--danger" onClick={() => requestDelete(idx)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}

          {adding && (
            <tr className="te-langs-new-row">
              <td><input className="te-input" placeholder="English" value={newLang.label}  onChange={e => setNewLang(b => ({...b, label:  e.target.value}))} /></td>
              <td><input className="te-input" placeholder="English" value={newLang.native} onChange={e => setNewLang(b => ({...b, native: e.target.value}))} /></td>
              <td><input className="te-input te-input--code" placeholder="en" value={newLang.code} onChange={e => setNewLang(b => ({...b, code: e.target.value}))} /></td>
              <td><input className="te-input te-input--flag" placeholder="🇺🇸" value={newLang.flag} onChange={e => setNewLang(b => ({...b, flag: e.target.value}))} /></td>
              <td className="te-langs-actions">
                <button className="te-btn-sm te-btn-sm--confirm" onClick={confirmAdd}><Check size={12} /></button>
                <button className="te-btn-sm" onClick={() => setAdding(false)}><X size={12} /></button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!adding && (
        <button className="te-add-lang-btn" onClick={() => setAdding(true)}>
          <Plus size={14} /> Adicionar novo idioma
        </button>
      )}

      {deleteTarget && (
        <DeleteLangModal
          lang={deleteTarget.lang}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
