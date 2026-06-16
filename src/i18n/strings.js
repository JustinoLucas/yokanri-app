/**
 * strings.js — Strings de i18n do app principal
 *
 * Suporta: pt-BR, en
 * Uso:
 *   import { useLanguage } from '../i18n/LanguageContext';
 *   const { t } = useLanguage();
 *   t('sidebar_library') // → 'Biblioteca' ou 'Library'
 */

export const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', native: 'Português', label: 'Português (BR)' },
  { code: 'en',   flag: '🇺🇸', native: 'English',   label: 'English' },
];

const strings = {
  'pt-BR': {

    // ── Geral ──────────────────────────────────────────────
    loading:          'Carregando...',
    back:             'Voltar',
    cancel:           'Cancelar',
    save:             'Salvar',
    add:              'Adicionar',
    edit:             'Editar',
    delete:           'Excluir',
    confirm:          'Confirmar',
    close:            'Fechar',
    search:           'Buscar',
    yes:              'Sim',
    no:               'Não',
    error:            'Erro',
    success:          'Sucesso',

    // ── Sidebar ────────────────────────────────────────────
    sidebar_workspace_eyebrow: 'espaço de trabalho',
    sidebar_library:           'Biblioteca',
    sidebar_profile:           'Meu Perfil',
    sidebar_calendar:          'Calendário',
    sidebar_stats:             'Estatísticas',
    sidebar_collections:       'Coleções',
    sidebar_new_collection:    'Nova coleção',

    // ── Topbar ─────────────────────────────────────────────
    topbar_search_placeholder: 'Buscar na biblioteca...',
    topbar_new_obra:           'Nova obra',
    topbar_settings:           'Configurações',

    // ── ObraList / Biblioteca ──────────────────────────────
    library_empty_title:    'Biblioteca vazia',
    library_empty_desc:     'Adicione sua primeira obra para começar.',
    library_add_btn:        'Adicionar obra',
    library_filter_all:     'Todos',
    library_sort_name:      'Nome',
    library_sort_date:      'Data',
    library_sort_chapters:  'Capítulos',
    library_sort_rating:    'Nota',

    // ── ObraForm ───────────────────────────────────────────
    form_new_title:         'Nova obra',
    form_edit_title:        'Editar obra',
    form_back:              'Biblioteca',
    form_save:              'Salvar',
    form_add:               'Adicionar',
    form_search_online:     'Buscar online',

    // Seção 01
    form_section_basic:     'Informações Básicas',
    form_nome_label:        'Nome *',
    form_nome_placeholder:  'Nome da obra',
    form_nome_alt_label:    'Nome Alternativo',
    form_nome_alt_ph:       'Nome em coreano/chinês/japonês',
    form_author_label:      'Autor',
    form_author_ph:         'Nome do autor',
    form_studio_label:      'Estúdio/Artista',
    form_studio_ph:         'Estúdio ou grupo',
    form_type_label:        'Tipo',
    form_year_label:        'Ano de Lançamento',
    form_year_ph:           'Ano do 1° capítulo',

    // Seção 02
    form_section_status:    'Status e Progresso',
    form_obra_status_label: 'Status da Obra',
    form_user_status_label: 'Meu Status',
    form_chapter_label:     'Capítulo Atual (Lançado)',
    form_user_chapter_label:'Meu Capítulo Atual',

    // Seção 03
    form_section_release:   'Padrão de Lançamento',
    form_release_type:      'Tipo de Lançamento',

    // Seção 04
    form_section_genres:    'Gêneros',

    // Seção 05
    form_section_rating:    'Avaliação',
    form_rating_label:      'Nota Geral',
    form_rating_ph:         '0.0 a 5.0',

    // Seção 06
    form_section_links:     'Links',
    form_link_add:          'Adicionar link',
    form_link_name_ph:      'Nome do site',
    form_link_url_ph:       'https://...',
    form_link_set_main:     'Definir como principal',

    // Seção 07
    form_section_covers:    'Capas',
    form_cover_add:         'Adicionar capa',
    form_cover_set_main:    'Definir como principal',

    // Seção 08
    form_section_notes:     'Anotações',
    form_notes_ph:          'Suas notas pessoais sobre a obra...',

    // ── ObraDetail ─────────────────────────────────────────
    detail_edit:            'Editar',
    detail_delete:          'Excluir',
    detail_close:           'Fechar',
    detail_confirm_delete_title: 'Excluir obra',
    detail_confirm_delete_text:  'Tem certeza que deseja excluir "{name}"? Essa ação não pode ser desfeita.',
    detail_confirm_delete_confirm: 'Excluir',
    detail_confirm_delete_cancel:  'Cancelar',

    // ── Configurações ──────────────────────────────────────
    config_title:           'Configurações',
    config_back:            'Biblioteca',
    config_nav_label:       'Opções',
    config_tab_general:     'Geral',
    config_tab_obra_status: 'Status da Obra',
    config_tab_user_status: 'Meu Status',
    config_tab_genres:      'Gêneros',

    config_section_updates:       'Atualizações',
    config_current_version:       'Versão atual',
    config_check_updates:         'Verificar atualizações',
    config_checking:              'Verificando…',
    config_up_to_date:            'Você já está na versão mais recente.',
    config_update_available:      'Atualizar para v{version}',
    config_downloading:           'Baixando atualização… {progress}%',
    config_update_installed:      'Atualização instalada — reinicie para aplicar.',
    config_update_error:          'Não foi possível verificar/instalar a atualização.',
    config_restart_now:           'Reiniciar agora',

    config_section_appearance:    'Aparência',
    config_theme_label:           'Tema',
    config_theme_dark_active:     'Tema escuro ativo',
    config_theme_light_active:    'Tema claro ativo',
    config_theme_to_light:        'Claro',
    config_theme_to_dark:         'Escuro',

    config_section_language:      'Idioma',
    config_language_label:        'Idioma do aplicativo',
    config_language_desc:         'A interface será atualizada imediatamente.',

    config_section_nsfw:          'Conteúdo adulto (+18)',
    config_nsfw_show_label:       'Mostrar normalmente',
    config_nsfw_show_desc:        'Conteúdo adulto exibido sem restrição.',
    config_nsfw_blur_label:       'Exibir com blur',
    config_nsfw_blur_desc:        'Capas borradas — reveladas só por clique explícito.',
    config_nsfw_hidden_label:     'Ocultar completamente',
    config_nsfw_hidden_desc:      'Obras NSFW não aparecem na biblioteca.',
    config_nsfw_hint:             'Marque gêneros como +18 na seção "Gêneros". No modo blur, a capa é revelada ao clicar nela.',

    config_item_none:             'Nenhum item cadastrado.',
    config_item_add_ph:           'Novo item…',
    config_item_add_btn:          'Adicionar',
    config_item_fixed:            'fixo',
    config_item_hide_schedule:    'oculta lançamento',

    // ── Estatísticas ───────────────────────────────────────
    stats_title:            'Estatísticas',
    stats_back:             'Biblioteca',
    stats_total:            'Total',
    stats_reading:          'Lendo',
    stats_completed:        'Completos',
    stats_avg_progress:     'Progresso Médio',
    stats_chapters_read:    'Capítulos Lidos',
    stats_type_dist:        'Distribuição por Tipo',
    stats_pub_status:       'Status de Publicação',
    stats_user_status:      'Meu Status de Leitura',
    stats_top5:             'Top 5 Mais Capítulos Lidos',
    stats_empty:            'Nenhuma obra na biblioteca ainda.',

    // ── Calendário ─────────────────────────────────────────
    calendar_title:         'Calendário',
    calendar_back:          'Biblioteca',
    calendar_empty:         'Nenhum lançamento encontrado.',
    calendar_today:         'Hoje',

    // ── Perfil ─────────────────────────────────────────────
    profile_banner_add:     'Adicionar banner',
    profile_banner_change:  'Alterar banner',
    profile_banner_position:'Posição do banner',
    profile_banner_delete:  'Excluir banner',

    // ── Busca online ───────────────────────────────────────
    search_modal_title:     'Buscar online',
    search_modal_ph:        'Nome da obra...',
    search_modal_btn:       'Buscar',
    search_modal_searching: 'Buscando...',
    search_modal_empty:     'Nenhum resultado encontrado.',
    search_modal_error:     'Erro ao buscar. Tente novamente.',
    search_source_anilist:  'AniList',
    search_source_mangadex: 'MangaDex',
    search_source_mu:       'MangaUpdates',

    // ── Coleções ───────────────────────────────────────────
    collection_unnamed:     'Nova Coleção',
    collection_rename:      'Renomear',
    collection_delete:      'Excluir coleção',
    collection_empty:       'Nenhuma obra nesta coleção.',
    collection_add_obras:   'Adicionar obras',
  },

  en: {

    // ── General ────────────────────────────────────────────
    loading:          'Loading...',
    back:             'Back',
    cancel:           'Cancel',
    save:             'Save',
    add:              'Add',
    edit:             'Edit',
    delete:           'Delete',
    confirm:          'Confirm',
    close:            'Close',
    search:           'Search',
    yes:              'Yes',
    no:               'No',
    error:            'Error',
    success:          'Success',

    // ── Sidebar ────────────────────────────────────────────
    sidebar_workspace_eyebrow: 'workspace',
    sidebar_library:           'Library',
    sidebar_profile:           'My Profile',
    sidebar_calendar:          'Calendar',
    sidebar_stats:             'Statistics',
    sidebar_collections:       'Collections',
    sidebar_new_collection:    'New collection',

    // ── Topbar ─────────────────────────────────────────────
    topbar_search_placeholder: 'Search library...',
    topbar_new_obra:           'New title',
    topbar_settings:           'Settings',

    // ── Library ────────────────────────────────────────────
    library_empty_title:    'Empty library',
    library_empty_desc:     'Add your first title to get started.',
    library_add_btn:        'Add title',
    library_filter_all:     'All',
    library_sort_name:      'Name',
    library_sort_date:      'Date',
    library_sort_chapters:  'Chapters',
    library_sort_rating:    'Rating',

    // ── ObraForm ───────────────────────────────────────────
    form_new_title:         'New title',
    form_edit_title:        'Edit title',
    form_back:              'Library',
    form_save:              'Save',
    form_add:               'Add',
    form_search_online:     'Search online',

    form_section_basic:     'Basic Information',
    form_nome_label:        'Name *',
    form_nome_placeholder:  'Title name',
    form_nome_alt_label:    'Alternative Name',
    form_nome_alt_ph:       'Korean / Chinese / Japanese name',
    form_author_label:      'Author',
    form_author_ph:         'Author name',
    form_studio_label:      'Studio/Artist',
    form_studio_ph:         'Studio or group',
    form_type_label:        'Type',
    form_year_label:        'Release Year',
    form_year_ph:           'Year of 1st chapter',

    form_section_status:    'Status & Progress',
    form_obra_status_label: 'Title Status',
    form_user_status_label: 'My Status',
    form_chapter_label:     'Current Chapter (Released)',
    form_user_chapter_label:'My Current Chapter',

    form_section_release:   'Release Schedule',
    form_release_type:      'Release Type',

    form_section_genres:    'Genres',

    form_section_rating:    'Rating',
    form_rating_label:      'Overall Rating',
    form_rating_ph:         '0.0 to 5.0',

    form_section_links:     'Links',
    form_link_add:          'Add link',
    form_link_name_ph:      'Site name',
    form_link_url_ph:       'https://...',
    form_link_set_main:     'Set as main',

    form_section_covers:    'Covers',
    form_cover_add:         'Add cover',
    form_cover_set_main:    'Set as main',

    form_section_notes:     'Notes',
    form_notes_ph:          'Your personal notes about this title...',

    // ── ObraDetail ─────────────────────────────────────────
    detail_edit:            'Edit',
    detail_delete:          'Delete',
    detail_close:           'Close',
    detail_confirm_delete_title:   'Delete title',
    detail_confirm_delete_text:    'Are you sure you want to delete "{name}"? This action cannot be undone.',
    detail_confirm_delete_confirm: 'Delete',
    detail_confirm_delete_cancel:  'Cancel',

    // ── Settings ───────────────────────────────────────────
    config_title:           'Settings',
    config_back:            'Library',
    config_nav_label:       'Options',
    config_tab_general:     'General',
    config_tab_obra_status: 'Title Status',
    config_tab_user_status: 'My Status',
    config_tab_genres:      'Genres',

    config_section_updates:       'Updates',
    config_current_version:       'Current version',
    config_check_updates:         'Check for updates',
    config_checking:              'Checking…',
    config_up_to_date:            'You are already on the latest version.',
    config_update_available:      'Update to v{version}',
    config_downloading:           'Downloading update… {progress}%',
    config_update_installed:      'Update installed — restart to apply.',
    config_update_error:          'Could not check/install the update.',
    config_restart_now:           'Restart now',

    config_section_appearance:    'Appearance',
    config_theme_label:           'Theme',
    config_theme_dark_active:     'Dark theme active',
    config_theme_light_active:    'Light theme active',
    config_theme_to_light:        'Light',
    config_theme_to_dark:         'Dark',

    config_section_language:      'Language',
    config_language_label:        'App language',
    config_language_desc:         'The interface will update immediately.',

    config_section_nsfw:          'Adult content (+18)',
    config_nsfw_show_label:       'Show normally',
    config_nsfw_show_desc:        'Adult content displayed without restriction.',
    config_nsfw_blur_label:       'Show with blur',
    config_nsfw_blur_desc:        'Covers blurred — revealed only on explicit click.',
    config_nsfw_hidden_label:     'Hide completely',
    config_nsfw_hidden_desc:      'NSFW titles do not appear in the library.',
    config_nsfw_hint:             'Mark genres as +18 in the "Genres" section. In blur mode, the cover is revealed by clicking on it.',

    config_item_none:             'No items registered.',
    config_item_add_ph:           'New item…',
    config_item_add_btn:          'Add',
    config_item_fixed:            'fixed',
    config_item_hide_schedule:    'hide schedule',

    // ── Statistics ─────────────────────────────────────────
    stats_title:            'Statistics',
    stats_back:             'Library',
    stats_total:            'Total',
    stats_reading:          'Reading',
    stats_completed:        'Completed',
    stats_avg_progress:     'Avg. Progress',
    stats_chapters_read:    'Chapters Read',
    stats_type_dist:        'Distribution by Type',
    stats_pub_status:       'Publication Status',
    stats_user_status:      'My Reading Status',
    stats_top5:             'Top 5 Most Chapters Read',
    stats_empty:            'No titles in the library yet.',

    // ── Calendar ───────────────────────────────────────────
    calendar_title:         'Calendar',
    calendar_back:          'Library',
    calendar_empty:         'No releases found.',
    calendar_today:         'Today',

    // ── Profile ────────────────────────────────────────────
    profile_banner_add:     'Add banner',
    profile_banner_change:  'Change banner',
    profile_banner_position:'Banner position',
    profile_banner_delete:  'Remove banner',

    // ── Online search ──────────────────────────────────────
    search_modal_title:     'Search online',
    search_modal_ph:        'Title name...',
    search_modal_btn:       'Search',
    search_modal_searching: 'Searching...',
    search_modal_empty:     'No results found.',
    search_modal_error:     'Search failed. Please try again.',
    search_source_anilist:  'AniList',
    search_source_mangadex: 'MangaDex',
    search_source_mu:       'MangaUpdates',

    // ── Collections ────────────────────────────────────────
    collection_unnamed:     'New Collection',
    collection_rename:      'Rename',
    collection_delete:      'Delete collection',
    collection_empty:       'No titles in this collection.',
    collection_add_obras:   'Add titles',
  },
};

/**
 * Retorna a função de tradução `t(key)` para o idioma informado.
 * Faz fallback para pt-BR se a chave não existir no idioma selecionado.
 */
export function getT(language) {
  const lang = strings[language] || strings['pt-BR'];
  const fallback = strings['pt-BR'];
  return (key) => lang[key] ?? fallback[key] ?? key;
}

export default strings;
