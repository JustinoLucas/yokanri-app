/**
 * SQLite Connection Manager
 *
 * Gerencia a conexão com o banco SQLite do workspace ativo.
 * - Uma conexão por workspace (lazy, cached)
 * - Troca automática ao mudar de workspace
 * - Executa migrations no primeiro acesso
 * - Migra dados JSON antigos automaticamente
 *
 * NOTA: tauri-plugin-sql usa connection pool (sqlx).
 * Transações explícitas (BEGIN/COMMIT) NÃO funcionam porque
 * cada execute() pode rodar numa conexão diferente do pool.
 * Cada execute() é auto-committed individualmente.
 */

import Database from '@tauri-apps/plugin-sql';
import { readFile, exists } from '@tauri-apps/plugin-fs';
import { getActiveSlug, getActiveWorkspaceDir, getFilePath, FILES, DIRS } from '../workspace/workspacePaths';
import { join } from '@tauri-apps/api/path';

// ─── STATE ──────────────────────────────────────────────

let currentDb = null;
let currentSlug = null;

const SCHEMA_VERSION = 2;

// ─── SCHEMA (statements individuais) ────────────────────

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS obras (
    id                        TEXT PRIMARY KEY,
    nome                      TEXT NOT NULL,
    nomeAlternativo           TEXT DEFAULT '',
    autor                     TEXT DEFAULT '',
    studio                    TEXT DEFAULT '',
    tipo                      TEXT DEFAULT 'Coreano',
    status                    TEXT DEFAULT 'em-andamento',
    statusUsuario             TEXT DEFAULT 'planeja-ler',
    capituloAtual             INTEGER DEFAULT 0,
    capituloAtualUsuario      INTEGER DEFAULT 0,
    nota                      REAL DEFAULT 0,
    notaUsuario               REAL DEFAULT 0,
    favorito                  INTEGER DEFAULT 0,
    anoLancamento             INTEGER,
    tipoLancamento            TEXT DEFAULT 'Irregular',
    intervaloSemanas          INTEGER DEFAULT 2,
    dataReferenciaQuinzenal   TEXT,
    diaDoMes                  INTEGER DEFAULT 1,
    detalhesLancamento        TEXT DEFAULT '',
    autoIncrementOnLink       INTEGER DEFAULT 0,
    notas                     TEXT DEFAULT '',
    dataAdicionado            TEXT NOT NULL,
    dataAtualizado            TEXT NOT NULL,
    dataInicioLeitura         TEXT,
    dataFimLeitura            TEXT,
    generos                   TEXT DEFAULT '[]',
    diasLancamento            TEXT DEFAULT '[]',
    links                     TEXT DEFAULT '[]',
    capas                     TEXT DEFAULT '[]'
  )`,
  `CREATE INDEX IF NOT EXISTS idx_obras_statusUsuario ON obras(statusUsuario)`,
  `CREATE INDEX IF NOT EXISTS idx_obras_tipo ON obras(tipo)`,
  `CREATE INDEX IF NOT EXISTS idx_obras_favorito ON obras(favorito)`,
  `CREATE INDEX IF NOT EXISTS idx_obras_dataAtualizado ON obras(dataAtualizado)`,
  `CREATE INDEX IF NOT EXISTS idx_obras_notaUsuario ON obras(notaUsuario)`,
  `CREATE TABLE IF NOT EXISTS settings (
    key    TEXT PRIMARY KEY,
    value  TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS meta (
    key    TEXT PRIMARY KEY,
    value  TEXT NOT NULL
  )`,
];

// ─── PUBLIC API ─────────────────────────────────────────

/**
 * Retorna a conexão SQLite do workspace ativo.
 * Abre/troca automaticamente ao mudar de workspace.
 */
export async function getDb() {
  const slug = getActiveSlug();
  if (!slug) {
    throw new Error('Nenhum workspace ativo. Chame storage.init() primeiro.');
  }

  // Conexão já aberta para este workspace
  if (currentDb && currentSlug === slug) {
    return currentDb;
  }

  // Fecha conexão anterior se existir
  if (currentDb) {
    try {
      await currentDb.close(currentDb.path);
    } catch (e) {
      console.warn('[SQLite] Erro ao fechar DB anterior:', e);
    }
    currentDb = null;
    currentSlug = null;
  }

  // Constrói path absoluto para o banco
  const wsDir = await getActiveWorkspaceDir();
  const dbPath = await join(wsDir, FILES.DATABASE);

  console.log(`[SQLite] Abrindo banco: ${dbPath}`);

  try {
    currentDb = await Database.load(`sqlite:${dbPath}`);
    currentSlug = slug;
    console.log('[SQLite] Conexão estabelecida');
  } catch (error) {
    console.error('[SQLite] Erro ao abrir banco:', error);
    throw error;
  }

  // Inicializa schema e migra dados se necessário
  try {
    await initializeDb(currentDb);
    console.log('[SQLite] Banco inicializado');
  } catch (error) {
    console.error('[SQLite] Erro ao inicializar banco:', error);
    throw error;
  }

  return currentDb;
}

/**
 * Fecha a conexão atual (chamado ao trocar workspace)
 */
export async function closeDb() {
  if (currentDb) {
    try {
      await currentDb.close(currentDb.path);
    } catch (e) {
      console.warn('[SQLite] Erro ao fechar DB:', e);
    }
    currentDb = null;
    currentSlug = null;
  }
}

// ─── INITIALIZATION ─────────────────────────────────────

/**
 * Inicializa o banco: cria tabelas, verifica versão, migra JSON
 */
async function initializeDb(db) {
  // Cria tabelas e índices (cada statement já é individual)
  for (let i = 0; i < SCHEMA_STATEMENTS.length; i++) {
    try {
      await db.execute(SCHEMA_STATEMENTS[i]);
    } catch (error) {
      console.error(`[SQLite] Erro no schema statement ${i}:`, error);
      throw error;
    }
  }

  // Verifica versão do schema
  const versionRows = await db.select("SELECT value FROM meta WHERE key = 'schemaVersion'");
  const currentVersion = versionRows.length > 0 ? parseInt(versionRows[0].value, 10) : 0;

  if (currentVersion < SCHEMA_VERSION) {
    // v1 → v2: converte status de texto label para ID estável
    if (currentVersion < 2) {
      await migrateV1toV2(db);
    }

    await db.execute(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schemaVersion', $1)",
      [String(SCHEMA_VERSION)]
    );
  }

  // Migra dados JSON se necessário
  await migrateFromJson(db);
}

// ─── SCHEMA MIGRATIONS ──────────────────────────────────

/**
 * v1 → v2: Converte status de label-string para ID estável.
 *
 * Antes (v1): status = 'Em andamento', statusUsuario = 'Lendo'
 * Depois (v2): status = 'em-andamento', statusUsuario = 'lendo'
 *
 * CASE-WHEN idempotente: se já estiver em formato ID, mantém sem alterar.
 * Valores desconhecidos recebem o default ('em-andamento' / 'planeja-ler').
 */
async function migrateV1toV2(db) {
  console.log('[SQLite] Migração v1→v2: convertendo status labels → IDs...');

  await db.execute(`
    UPDATE obras SET status = CASE
      WHEN status IN ('em-andamento','completo','hiato','cancelado','nao-definido') THEN status
      WHEN status = 'Em andamento' THEN 'em-andamento'
      WHEN status = 'Completo'     THEN 'completo'
      WHEN status = 'Hiato'        THEN 'hiato'
      WHEN status = 'Cancelado'    THEN 'cancelado'
      WHEN status = 'Não definido' THEN 'nao-definido'
      ELSE 'em-andamento'
    END
  `);

  await db.execute(`
    UPDATE obras SET statusUsuario = CASE
      WHEN statusUsuario IN ('lendo','completo','dropado','planeja-ler','pausado','nao-definido') THEN statusUsuario
      WHEN statusUsuario = 'Lendo'       THEN 'lendo'
      WHEN statusUsuario = 'Completo'    THEN 'completo'
      WHEN statusUsuario = 'Dropado'     THEN 'dropado'
      WHEN statusUsuario = 'Planeja ler' THEN 'planeja-ler'
      WHEN statusUsuario = 'Pausado'     THEN 'pausado'
      WHEN statusUsuario = 'Não definido' THEN 'nao-definido'
      ELSE 'planeja-ler'
    END
  `);

  console.log('[SQLite] ✓ Migração v1→v2 concluída');
}

// ─── JSON MIGRATION ─────────────────────────────────────

/**
 * Migra dados de library.json e settings.json para SQLite.
 * Executa apenas uma vez — marca como feito na tabela meta.
 */
async function migrateFromJson(db) {
  // Verifica se já migrou
  const migrated = await db.select("SELECT value FROM meta WHERE key = 'jsonMigrated'");
  if (migrated.length > 0 && migrated[0].value === 'true') {
    return;
  }

  console.log('[SQLite] Verificando dados JSON para migração...');

  // ── Migrar library.json ─────────────────────────
  try {
    const libraryPath = await getFilePath(FILES.LIBRARY);
    const libraryExists = await exists(libraryPath);

    if (libraryExists) {
      const content = await readFile(libraryPath);
      const text = new TextDecoder().decode(content);
      const obras = JSON.parse(text);

      if (Array.isArray(obras) && obras.length > 0) {
        console.log(`[SQLite] Migrando ${obras.length} obras do JSON...`);

        let inserted = 0;
        for (const obra of obras) {
          try {
            await insertObra(db, obra);
            inserted++;
          } catch (error) {
            console.error(`[SQLite] Erro ao inserir obra "${obra.nome || obra.id}":`, error);
            // Continua com as outras obras — não aborta tudo
          }
        }
        console.log(`[SQLite] ✓ ${inserted}/${obras.length} obras migradas`);
      }
    }
  } catch (error) {
    console.error('[SQLite] Erro ao ler library.json:', error);
    // Não marca como migrado — tentará novamente no próximo init
    return;
  }

  // ── Migrar settings.json ────────────────────────
  try {
    const settingsPath = await getFilePath(FILES.SETTINGS);
    const settingsExists = await exists(settingsPath);

    if (settingsExists) {
      const content = await readFile(settingsPath);
      const text = new TextDecoder().decode(content);
      const config = JSON.parse(text);

      if (config && typeof config === 'object') {
        await db.execute(
          "INSERT OR REPLACE INTO settings (key, value) VALUES ('config', $1)",
          [JSON.stringify(config)]
        );
        console.log('[SQLite] ✓ Configurações migradas');
      }
    }
  } catch (error) {
    console.error('[SQLite] Erro ao migrar settings.json:', error);
  }

  // Marca como migrado
  await db.execute(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('jsonMigrated', 'true')"
  );

  console.log('[SQLite] Migração JSON → SQLite concluída');
}

/**
 * Insere uma obra no banco (usado na migração e no saveObras)
 */
export async function insertObra(db, obra) {
  await db.execute(
    `INSERT INTO obras (
      id, nome, nomeAlternativo, autor, studio, tipo,
      status, statusUsuario, capituloAtual, capituloAtualUsuario,
      nota, notaUsuario, favorito, anoLancamento,
      tipoLancamento, intervaloSemanas, dataReferenciaQuinzenal,
      diaDoMes, detalhesLancamento, autoIncrementOnLink,
      notas, dataAdicionado, dataAtualizado,
      dataInicioLeitura, dataFimLeitura,
      generos, diasLancamento, links, capas
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29
    )`,
    [
      obra.id,
      obra.nome,
      obra.nomeAlternativo || '',
      obra.autor || '',
      obra.studio || '',
      obra.tipo || 'Coreano',
      obra.status || 'em-andamento',
      obra.statusUsuario || 'planeja-ler',
      obra.capituloAtual || 0,
      obra.capituloAtualUsuario || 0,
      obra.nota || 0,
      obra.notaUsuario || 0,
      obra.favorito ? 1 : 0,
      obra.anoLancamento ?? null,
      obra.tipoLancamento || 'Irregular',
      obra.intervaloSemanas ?? 2,
      obra.dataReferenciaQuinzenal || null,
      obra.diaDoMes ?? 1,
      obra.detalhesLancamento || '',
      obra.autoIncrementOnLink ? 1 : 0,
      obra.notas || '',
      obra.dataAdicionado || new Date().toISOString(),
      obra.dataAtualizado || new Date().toISOString(),
      obra.dataInicioLeitura || null,
      obra.dataFimLeitura || null,
      JSON.stringify(obra.generos || []),
      JSON.stringify(obra.diasLancamento || []),
      JSON.stringify(obra.links || []),
      JSON.stringify(obra.capas || []),
    ]
  );
}
