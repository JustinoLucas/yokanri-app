/**
 * strings.js — Strings de i18n para o fluxo de onboarding do Yokanri
 *
 * Suporta: pt-BR, en, es, ja
 * Usado APENAS durante o onboarding — o app em si permanece em pt-BR.
 *
 * Uso:
 *   import { getT } from './strings';
 *   const t = getT('en');
 *   t('welcome_title') // → 'Welcome to Yokanri'
 */

/** Metadados dos idiomas suportados no onboarding */
export const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', native: 'Português' },
  { code: 'en',   flag: '🇺🇸', native: 'English' },
  { code: 'es',   flag: '🇪🇸', native: 'Español' },
  { code: 'ja',   flag: '🇯🇵', native: '日本語' },
];

const strings = {
  'pt-BR': {
    // ── Step 1: Bem-vindo ────────────────────────────────
    welcome_title: 'Bem-vindo ao Yokanri',
    welcome_subtitle: 'Seu tracker pessoal de mangás e manhwas.',
    welcome_choose_language: 'Escolha seu idioma:',
    welcome_continue: 'Continuar',

    // ── Step 2: Edição ───────────────────────────────────
    edition_title: 'Qual versão você escolheu?',
    edition_subtitle: 'Isso nos ajuda a configurar a sua experiência.',
    edition_core_name: 'Core',
    edition_core_tag: 'Gratuito',
    edition_core_desc: 'Versão gratuita e completa. Todas as funcionalidades essenciais para gerenciar sua biblioteca pessoal.',
    edition_core_btn: 'Continuar com Core',
    edition_supporter_name: 'Supporter',
    edition_supporter_tag: 'Apoiador',
    edition_supporter_desc: 'Apoie o desenvolvimento do Yokanri e tenha acesso a recursos exclusivos. Muito obrigado!',
    edition_supporter_btn: 'Continuar com Supporter',

    // ── Step 3: Código Supporter ─────────────────────────
    supporter_title: 'Código Supporter',
    supporter_subtitle: 'Insira seu código para ativar os benefícios de apoiador.',
    supporter_placeholder: 'Ex: YOKA-1234-ABCD',
    supporter_activate: 'Ativar código',
    supporter_skip: 'Pular por enquanto',
    supporter_error_empty: 'Por favor, insira um código.',
    supporter_error_invalid: 'Código inválido. Verifique e tente novamente.',
    supporter_success: 'Código ativado com sucesso!',

    // ── Step 4: Workspace ────────────────────────────────
    workspace_title: 'Crie sua biblioteca',
    workspace_subtitle: 'Onde suas obras serão armazenadas localmente.',
    workspace_create_label: 'Nova biblioteca',
    workspace_create_desc: 'Crie uma biblioteca em branco para começar do zero.',
    workspace_create_name_placeholder: 'Nome da biblioteca',
    workspace_create_name_label: 'Nome',
    workspace_create_btn: 'Criar biblioteca',
    workspace_import_label: 'Importar backup',
    workspace_import_desc: 'Restaure um backup .yokanri existente com suas obras.',
    workspace_import_btn: 'Selecionar arquivo',
    workspace_import_preview_title: 'Backup encontrado',
    workspace_import_preview_obras: 'obras',
    workspace_import_confirm: 'Importar e continuar',
    workspace_name_empty: 'O nome não pode estar vazio.',
    workspace_creating: 'Criando...',
    workspace_importing: 'Importando...',
    workspace_error_create: 'Erro ao criar a biblioteca. Tente novamente.',
    workspace_error_import: 'Erro ao importar o arquivo. Verifique e tente novamente.',

    // ── Comum ────────────────────────────────────────────
    back: 'Voltar',
    loading: 'Aguarde...',
  },

  en: {
    welcome_title: 'Welcome to Yokanri',
    welcome_subtitle: 'Your personal manga and manhwa tracker.',
    welcome_choose_language: 'Choose your language:',
    welcome_continue: 'Continue',

    edition_title: 'Which version did you choose?',
    edition_subtitle: 'This helps us configure your experience.',
    edition_core_name: 'Core',
    edition_core_tag: 'Free',
    edition_core_desc: 'Complete free version. All the essential features to manage your personal library.',
    edition_core_btn: 'Continue with Core',
    edition_supporter_name: 'Supporter',
    edition_supporter_tag: 'Supporter',
    edition_supporter_desc: 'Support Yokanri\'s development and unlock exclusive features. Thank you so much!',
    edition_supporter_btn: 'Continue with Supporter',

    supporter_title: 'Supporter Code',
    supporter_subtitle: 'Enter your code to activate supporter benefits.',
    supporter_placeholder: 'e.g. YOKA-1234-ABCD',
    supporter_activate: 'Activate code',
    supporter_skip: 'Skip for now',
    supporter_error_empty: 'Please enter a code.',
    supporter_error_invalid: 'Invalid code. Please check and try again.',
    supporter_success: 'Code activated successfully!',

    workspace_title: 'Create your library',
    workspace_subtitle: 'Where your works will be stored locally.',
    workspace_create_label: 'New library',
    workspace_create_desc: 'Create a blank library to start from scratch.',
    workspace_create_name_placeholder: 'Library name',
    workspace_create_name_label: 'Name',
    workspace_create_btn: 'Create library',
    workspace_import_label: 'Import backup',
    workspace_import_desc: 'Restore an existing .yokanri backup with your works.',
    workspace_import_btn: 'Select file',
    workspace_import_preview_title: 'Backup found',
    workspace_import_preview_obras: 'works',
    workspace_import_confirm: 'Import and continue',
    workspace_name_empty: 'Name cannot be empty.',
    workspace_creating: 'Creating...',
    workspace_importing: 'Importing...',
    workspace_error_create: 'Failed to create library. Please try again.',
    workspace_error_import: 'Failed to import file. Please check and try again.',

    back: 'Back',
    loading: 'Please wait...',
  },

  es: {
    welcome_title: 'Bienvenido a Yokanri',
    welcome_subtitle: 'Tu rastreador personal de mangas y manhwas.',
    welcome_choose_language: 'Elige tu idioma:',
    welcome_continue: 'Continuar',

    edition_title: '¿Qué versión elegiste?',
    edition_subtitle: 'Esto nos ayuda a configurar tu experiencia.',
    edition_core_name: 'Core',
    edition_core_tag: 'Gratis',
    edition_core_desc: 'Versión gratuita y completa. Todas las funciones esenciales para gestionar tu biblioteca personal.',
    edition_core_btn: 'Continuar con Core',
    edition_supporter_name: 'Supporter',
    edition_supporter_tag: 'Colaborador',
    edition_supporter_desc: '¡Apoya el desarrollo de Yokanri y desbloquea funciones exclusivas. ¡Muchas gracias!',
    edition_supporter_btn: 'Continuar con Supporter',

    supporter_title: 'Código Supporter',
    supporter_subtitle: 'Ingresa tu código para activar los beneficios de colaborador.',
    supporter_placeholder: 'Ej: YOKA-1234-ABCD',
    supporter_activate: 'Activar código',
    supporter_skip: 'Omitir por ahora',
    supporter_error_empty: 'Por favor, ingresa un código.',
    supporter_error_invalid: 'Código inválido. Verifica e intenta nuevamente.',
    supporter_success: '¡Código activado con éxito!',

    workspace_title: 'Crea tu biblioteca',
    workspace_subtitle: 'Donde se almacenarán tus obras localmente.',
    workspace_create_label: 'Nueva biblioteca',
    workspace_create_desc: 'Crea una biblioteca vacía para empezar desde cero.',
    workspace_create_name_placeholder: 'Nombre de la biblioteca',
    workspace_create_name_label: 'Nombre',
    workspace_create_btn: 'Crear biblioteca',
    workspace_import_label: 'Importar copia de seguridad',
    workspace_import_desc: 'Restaura una copia de seguridad .yokanri existente con tus obras.',
    workspace_import_btn: 'Seleccionar archivo',
    workspace_import_preview_title: 'Copia encontrada',
    workspace_import_preview_obras: 'obras',
    workspace_import_confirm: 'Importar y continuar',
    workspace_name_empty: 'El nombre no puede estar vacío.',
    workspace_creating: 'Creando...',
    workspace_importing: 'Importando...',
    workspace_error_create: 'Error al crear la biblioteca. Inténtalo de nuevo.',
    workspace_error_import: 'Error al importar el archivo. Verifica e intenta de nuevo.',

    back: 'Volver',
    loading: 'Por favor espera...',
  },

  ja: {
    welcome_title: 'Yokanriへようこそ',
    welcome_subtitle: 'あなただけのマンガ・マンファ管理アプリ。',
    welcome_choose_language: '言語を選択してください：',
    welcome_continue: '続ける',

    edition_title: 'どのバージョンを選びましたか？',
    edition_subtitle: 'お好みに合わせて設定します。',
    edition_core_name: 'Core',
    edition_core_tag: '無料',
    edition_core_desc: '完全無料版。個人ライブラリ管理に必要なすべての機能が揃っています。',
    edition_core_btn: 'Coreで続ける',
    edition_supporter_name: 'Supporter',
    edition_supporter_tag: 'サポーター',
    edition_supporter_desc: 'Yokanriの開発を支援して限定機能を解除しましょう。本当にありがとうございます！',
    edition_supporter_btn: 'Supporterで続ける',

    supporter_title: 'サポーターコード',
    supporter_subtitle: 'コードを入力してサポーター特典を有効にしてください。',
    supporter_placeholder: '例：YOKA-1234-ABCD',
    supporter_activate: 'コードを有効化',
    supporter_skip: '後でスキップ',
    supporter_error_empty: 'コードを入力してください。',
    supporter_error_invalid: '無効なコードです。確認してもう一度お試しください。',
    supporter_success: 'コードが正常に有効化されました！',

    workspace_title: 'ライブラリを作成',
    workspace_subtitle: 'あなたの作品がローカルに保存される場所です。',
    workspace_create_label: '新しいライブラリ',
    workspace_create_desc: 'ゼロから始めるための空のライブラリを作成します。',
    workspace_create_name_placeholder: 'ライブラリ名',
    workspace_create_name_label: '名前',
    workspace_create_btn: 'ライブラリを作成',
    workspace_import_label: 'バックアップをインポート',
    workspace_import_desc: '既存の.yokanriバックアップを作品ごと復元します。',
    workspace_import_btn: 'ファイルを選択',
    workspace_import_preview_title: 'バックアップが見つかりました',
    workspace_import_preview_obras: '作品',
    workspace_import_confirm: 'インポートして続ける',
    workspace_name_empty: '名前を入力してください。',
    workspace_creating: '作成中...',
    workspace_importing: 'インポート中...',
    workspace_error_create: 'ライブラリの作成に失敗しました。もう一度お試しください。',
    workspace_error_import: 'ファイルのインポートに失敗しました。確認してもう一度お試しください。',

    back: '戻る',
    loading: 'お待ちください...',
  },
};

/**
 * Retorna a função de tradução `t(key)` para o idioma informado.
 * Faz fallback para pt-BR se a chave não existir no idioma selecionado.
 *
 * @param {string} language - Código do idioma ('pt-BR', 'en', 'es', 'ja')
 * @returns {function(string): string}
 */
export function getT(language) {
  const lang = strings[language] || strings['pt-BR'];
  const fallback = strings['pt-BR'];
  return (key) => lang[key] ?? fallback[key] ?? key;
}

export default strings;
