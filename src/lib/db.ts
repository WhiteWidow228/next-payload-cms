import { Pool, type PoolConfig } from "pg";

type TeamMember = {
  name: string;
  avatar: string;
};

export type CompanyWorkItem = {
  id: number;
  title: string;
  summary: string;
  category: string;
  timeTaken: string;
  image: string;
  imageAlt: string;
  technologies: string[];
  teamMembers: TeamMember[];
  ctaLabel: string;
  sortOrder: number;
};

export type CompanyWorkInput = Omit<CompanyWorkItem, "id">;

type DatabaseEnvSource = (typeof DATABASE_ENV_KEYS)[number] | "local" | "missing";

type DatabaseEnvSummary = {
  source: DatabaseEnvSource;
  host: string;
  database: string;
};

const DATABASE_ENV_KEYS = [
  "DATABASE_URI",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

const LOCAL_DATABASE_URI = "postgres://postgres:123321@localhost:5432/core_devs_cms";
const DEFAULT_CTA_LABEL = "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441\u043c\u0435\u0442\u0443";
const DEFAULT_TEAM_MEMBER_NAME = "\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a \u043a\u043e\u043c\u0430\u043d\u0434\u044b";

const globalForDb = globalThis as unknown as { coreDevsPool?: Pool };

function cleanConnectionString(value?: string) {
  let connectionString = value?.trim() || "";

  if (!connectionString) {
    return "";
  }

  const assignment = connectionString.match(
    /^(DATABASE_URI|DATABASE_URL|POSTGRES_URL|POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING)\s*=\s*(.+)$/,
  );

  if (assignment) {
    connectionString = assignment[2].trim();
  }

  if (
    (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
    (connectionString.startsWith("'") && connectionString.endsWith("'"))
  ) {
    connectionString = connectionString.slice(1, -1);
  }

  return connectionString;
}

function resolveConnectionString() {
  for (const key of DATABASE_ENV_KEYS) {
    const connectionString = cleanConnectionString(process.env[key]);

    if (connectionString) {
      return { connectionString, source: key };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return { connectionString: LOCAL_DATABASE_URI, source: "local" as const };
  }

  return { connectionString: "", source: "missing" as const };
}

function getConnectionString() {
  const { connectionString } = resolveConnectionString();

  if (connectionString) {
    return connectionString;
  }

  throw new Error(`Postgres connection string is not configured. Add one of: ${DATABASE_ENV_KEYS.join(", ")}`);
}

function shouldUseSsl(connectionString: string) {
  return /neon\.tech|sslmode=require|sslmode=verify-full|sslmode=verify-ca/i.test(connectionString);
}

function getPoolConfig(): PoolConfig {
  const connectionString = getConnectionString();

  return {
    connectionString,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 3,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  };
}

function getDb() {
  if (!globalForDb.coreDevsPool) {
    globalForDb.coreDevsPool = new Pool(getPoolConfig());
  }

  return globalForDb.coreDevsPool;
}

export function getDatabaseEnvSummary(): DatabaseEnvSummary {
  const { connectionString, source } = resolveConnectionString();

  if (!connectionString) {
    return { source, host: "", database: "" };
  }

  try {
    const url = new URL(connectionString);

    return {
      source,
      host: url.hostname,
      database: url.pathname.replace(/^\//, ""),
    };
  } catch {
    return { source, host: "не удалось прочитать", database: "не удалось прочитать" };
  }
}

export function getDatabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("connection string is not configured")) {
    return `В Vercel не задана переменная базы. Добавь одну из: ${DATABASE_ENV_KEYS.join(", ")}.`;
  }

  if (lowerMessage.includes("password authentication failed") || lowerMessage.includes("authentication failed")) {
    return "Postgres отклонил логин или пароль. Проверь актуальную строку подключения Neon в переменных Vercel.";
  }

  if (lowerMessage.includes("enotfound") || lowerMessage.includes("getaddrinfo")) {
    return "Vercel не смог найти host Postgres. Проверь, что строка подключения скопирована полностью.";
  }

  if (
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("etimedout") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("connection terminated")
  ) {
    return "Postgres не ответил вовремя. Проверь Neon, SSL-параметры и что база не в паузе.";
  }

  if (lowerMessage.includes("ssl") || lowerMessage.includes("certificate")) {
    return "Postgres вернул ошибку SSL. Для Neon включён явный SSL-режим, сделай Redeploy последнего коммита.";
  }

  return `Postgres вернул ошибку: ${message}`;
}

export async function ensureCompanyWorkTable() {
  await getDb().query(`
    CREATE TABLE IF NOT EXISTS company_work_items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      time_taken TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      image_alt TEXT NOT NULL DEFAULT '',
      technologies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      team_members JSONB NOT NULL DEFAULT '[]'::JSONB,
      cta_label TEXT NOT NULL DEFAULT '\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441\u043c\u0435\u0442\u0443',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function normalizeTeamMembers(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((member, index) => {
      if (!member || typeof member !== "object") {
        return null;
      }

      const item = member as Partial<TeamMember>;
      const name = item.name?.trim() || `${DEFAULT_TEAM_MEMBER_NAME} ${index + 1}`;
      const avatar = item.avatar?.trim() || `/assets/avatar-${(index % 6) + 1}.png`;

      return { name, avatar };
    })
    .filter((member): member is TeamMember => Boolean(member));
}

function mapCompanyWork(row: Record<string, unknown>): CompanyWorkItem {
  return {
    id: Number(row.id),
    title: String(row.title || ""),
    summary: String(row.summary || ""),
    category: String(row.category || ""),
    timeTaken: String(row.timeTaken || row.time_taken || ""),
    image: String(row.image || ""),
    imageAlt: String(row.imageAlt || row.image_alt || ""),
    technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [],
    teamMembers: normalizeTeamMembers(row.teamMembers || row.team_members),
    ctaLabel: String(row.ctaLabel || row.cta_label || DEFAULT_CTA_LABEL),
    sortOrder: Number(row.sortOrder || row.sort_order || 0),
  };
}

export async function listCompanyWorkItems() {
  await ensureCompanyWorkTable();

  const result = await getDb().query(`
    SELECT
      id,
      title,
      summary,
      category,
      time_taken AS "timeTaken",
      image,
      image_alt AS "imageAlt",
      technologies,
      team_members AS "teamMembers",
      cta_label AS "ctaLabel",
      sort_order AS "sortOrder"
    FROM company_work_items
    ORDER BY sort_order ASC, id ASC
  `);

  return result.rows.map(mapCompanyWork);
}

export async function getCompanyWorkItem(id: number) {
  await ensureCompanyWorkTable();

  const result = await getDb().query(
    `
      SELECT
        id,
        title,
        summary,
        category,
        time_taken AS "timeTaken",
        image,
        image_alt AS "imageAlt",
        technologies,
        team_members AS "teamMembers",
        cta_label AS "ctaLabel",
        sort_order AS "sortOrder"
      FROM company_work_items
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ? mapCompanyWork(result.rows[0]) : null;
}

export async function createCompanyWorkItem(input: CompanyWorkInput) {
  await ensureCompanyWorkTable();

  await getDb().query(
    `
      INSERT INTO company_work_items (
        title,
        summary,
        category,
        time_taken,
        image,
        image_alt,
        technologies,
        team_members,
        cta_label,
        sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
    `,
    [
      input.title,
      input.summary,
      input.category,
      input.timeTaken,
      input.image,
      input.imageAlt,
      input.technologies,
      JSON.stringify(input.teamMembers),
      input.ctaLabel,
      input.sortOrder,
    ],
  );
}

export async function updateCompanyWorkItem(id: number, input: CompanyWorkInput) {
  await ensureCompanyWorkTable();

  await getDb().query(
    `
      UPDATE company_work_items
      SET
        title = $2,
        summary = $3,
        category = $4,
        time_taken = $5,
        image = $6,
        image_alt = $7,
        technologies = $8,
        team_members = $9::jsonb,
        cta_label = $10,
        sort_order = $11,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      input.title,
      input.summary,
      input.category,
      input.timeTaken,
      input.image,
      input.imageAlt,
      input.technologies,
      JSON.stringify(input.teamMembers),
      input.ctaLabel,
      input.sortOrder,
    ],
  );
}

export async function deleteCompanyWorkItem(id: number) {
  await ensureCompanyWorkTable();
  await getDb().query("DELETE FROM company_work_items WHERE id = $1", [id]);
}