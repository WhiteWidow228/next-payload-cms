import { Pool, type PoolConfig } from "pg";

import { hashPassword, verifyPassword } from "@/lib/passwords";

type TeamMember = {
  name: string;
  avatar: string;
};

export type ProjectCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export type ProjectCategoryInput = Omit<ProjectCategory, "id">;

export type CompanyWorkItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  projectText: string;
  category: string;
  categorySlug: string;
  timeTaken: string;
  image: string;
  detailImage: string;
  imageAlt: string;
  technologies: string[];
  teamMembers: TeamMember[];
  ctaLabel: string;
  sortOrder: number;
};

export type CompanyWorkInput = Omit<CompanyWorkItem, "id">;

export type AdminUser = {
  id: number;
  login: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

type AdminUserRecord = AdminUser & {
  passwordHash: string;
};

export type AdminUserInput = {
  login: string;
  name: string;
  passwordHash?: string;
  isActive: boolean;
};
export type MediaAsset = {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  src: string;
  createdAt: string;
};

export type MediaAssetInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  content: Buffer;
};

export type MediaAssetRecord = MediaAsset & {
  content: Buffer;
};

export type QuizLeadStatus = "new" | "processed";

export type QuizLead = {
  id: number;
  projectType: string;
  budget: string;
  timeline: string;
  contact: string;
  sourcePath: string;
  status: QuizLeadStatus;
  consentVersion: string;
  consentAt: string;
  createdAt: string;
};

export type QuizLeadInput = Pick<
  QuizLead,
  "projectType" | "budget" | "timeline" | "contact" | "sourcePath" | "consentVersion"
>;
const DATABASE_ENV_KEYS = [
  "DATABASE_URI",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

type DatabaseEnvSource = (typeof DATABASE_ENV_KEYS)[number] | "missing";

type DatabaseEnvSummary = {
  source: DatabaseEnvSource;
  host: string;
  database: string;
};

const DEFAULT_CTA_LABEL = "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441\u043c\u0435\u0442\u0443";
const DEFAULT_TEAM_MEMBER_NAME = "\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a \u043a\u043e\u043c\u0430\u043d\u0434\u044b";

const DEFAULT_CATEGORIES: ProjectCategoryInput[] = [
  {
    name: "\u0421\u0430\u0439\u0442\u044b",
    slug: "sites",
    description: "\u041b\u0435\u043d\u0434\u0438\u043d\u0433\u0438, \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0435 \u0441\u0430\u0439\u0442\u044b \u0438 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442-\u043c\u0430\u0433\u0430\u0437\u0438\u043d\u044b",
    sortOrder: 0,
  },
  {
    name: "\u0411\u043e\u0442\u044b",
    slug: "bots",
    description: "Telegram-\u0431\u043e\u0442\u044b, \u0430\u0432\u0442\u043e\u0432\u043e\u0440\u043e\u043d\u043a\u0438 \u0438 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044f \u0437\u0430\u044f\u0432\u043e\u043a",
    sortOrder: 1,
  },
  {
    name: "\u0414\u0438\u0437\u0430\u0439\u043d",
    slug: "design",
    description: "UI/UX, \u043c\u0430\u043a\u0435\u0442\u044b \u0432 Figma, \u0434\u0438\u0437\u0430\u0439\u043d-\u0441\u0438\u0441\u0442\u0435\u043c\u044b \u0438 \u0440\u0435\u0434\u0438\u0437\u0430\u0439\u043d",
    sortOrder: 2,
  },
  {
    name: "\u0412\u0435\u0431-\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f",
    slug: "apps",
    description: "\u041b\u0438\u0447\u043d\u044b\u0435 \u043a\u0430\u0431\u0438\u043d\u0435\u0442\u044b, CRM, \u0441\u0435\u0440\u0432\u0438\u0441\u044b \u0438 \u0441\u043b\u043e\u0436\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u044b",
    sortOrder: 3,
  },
];

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
    return { source, host: "unreadable", database: "unreadable" };
  }
}

export function getDatabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("connection string is not configured")) {
    return `Database env variable is missing in the hosting environment. Add one of: ${DATABASE_ENV_KEYS.join(", ")}.`;
  }

  if (lowerMessage.includes("password authentication failed") || lowerMessage.includes("authentication failed")) {
    return "Postgres rejected the login or password. Check the current Neon connection string in the hosting variables.";
  }

  if (lowerMessage.includes("enotfound") || lowerMessage.includes("getaddrinfo")) {
    return "The hosting server could not resolve the Postgres host. Check that the connection string is copied completely.";
  }

  if (
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("etimedout") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("connection terminated")
  ) {
    return "Postgres did not respond in time. Check Neon, SSL settings, and whether the database is paused.";
  }

  if (lowerMessage.includes("ssl") || lowerMessage.includes("certificate")) {
    return "Postgres returned an SSL error. Neon SSL mode is enabled in the app, redeploy the latest commit.";
  }

  return `Postgres returned an error: ${message}`;
}

async function ensureAdminUsersTable() {
  await getDb().query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      login TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await getDb().query("CREATE INDEX IF NOT EXISTS admin_users_active_idx ON admin_users (is_active)");

  const countResult = await getDb().query("SELECT COUNT(*)::int AS count FROM admin_users");
  const usersCount = Number(countResult.rows[0]?.count || 0);
  const initialPassword = process.env.ADMIN_PASSWORD?.trim();

  if (usersCount > 0 || !initialPassword) {
    return;
  }

  const login = (process.env.ADMIN_LOGIN || "admin").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || "Администратор").trim();
  const passwordHash = await hashPassword(initialPassword);

  await getDb().query(
    `
      INSERT INTO admin_users (login, name, password_hash, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (login) DO NOTHING
    `,
    [login, name, passwordHash],
  );
}
async function ensureProjectCategoriesTable() {
  await getDb().query(`
    CREATE TABLE IF NOT EXISTS project_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const category of DEFAULT_CATEGORIES) {
    await getDb().query(
      `
        INSERT INTO project_categories (name, slug, description, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO NOTHING
      `,
      [category.name, category.slug, category.description, category.sortOrder],
    );
  }
}

export async function ensureCompanyWorkTable() {
  await ensureProjectCategoriesTable();

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

  await getDb().query("ALTER TABLE company_work_items ADD COLUMN IF NOT EXISTS slug TEXT");
  await getDb().query("ALTER TABLE company_work_items ADD COLUMN IF NOT EXISTS project_text TEXT NOT NULL DEFAULT ''");
  await getDb().query("ALTER TABLE company_work_items ADD COLUMN IF NOT EXISTS detail_image TEXT NOT NULL DEFAULT ''");
  await getDb().query("ALTER TABLE company_work_items ADD COLUMN IF NOT EXISTS category_slug TEXT NOT NULL DEFAULT 'sites'");
  await getDb().query("UPDATE company_work_items SET slug = CONCAT('work-', id) WHERE slug IS NULL OR slug = ''");
  await getDb().query("UPDATE company_work_items SET slug = 'zenith-fitness-app' WHERE title ILIKE '%Zenith%' AND slug LIKE 'work-%'");
  await getDb().query("UPDATE company_work_items SET slug = 'a-aura-ecommerce' WHERE title ILIKE '%A-Aura%' AND slug LIKE 'work-%'");
  await getDb().query("UPDATE company_work_items SET category_slug = 'apps' WHERE category_slug = 'sites' AND (category ILIKE '%app%' OR category ILIKE '%прилож%')");
  await getDb().query("UPDATE company_work_items SET category_slug = 'design' WHERE category_slug = 'sites' AND category ILIKE '%дизайн%'");
  await getDb().query("CREATE UNIQUE INDEX IF NOT EXISTS company_work_items_slug_idx ON company_work_items (slug)");
  await getDb().query("CREATE INDEX IF NOT EXISTS company_work_items_category_slug_idx ON company_work_items (category_slug)");
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

function mapCategory(row: Record<string, unknown>): ProjectCategory {
  return {
    id: Number(row.id),
    name: String(row.name || ""),
    slug: String(row.slug || ""),
    description: String(row.description || ""),
    sortOrder: Number(row.sortOrder || row.sort_order || 0),
  };
}

function mapCompanyWork(row: Record<string, unknown>): CompanyWorkItem {
  return {
    id: Number(row.id),
    slug: String(row.slug || `work-${row.id}`),
    title: String(row.title || ""),
    summary: String(row.summary || ""),
    projectText: String(row.projectText || row.project_text || ""),
    category: String(row.category || ""),
    categorySlug: String(row.categorySlug || row.category_slug || "sites"),
    timeTaken: String(row.timeTaken || row.time_taken || ""),
    image: String(row.image || ""),
    detailImage: String(row.detailImage || row.detail_image || ""),
    imageAlt: String(row.imageAlt || row.image_alt || ""),
    technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [],
    teamMembers: normalizeTeamMembers(row.teamMembers || row.team_members),
    ctaLabel: String(row.ctaLabel || row.cta_label || DEFAULT_CTA_LABEL),
    sortOrder: Number(row.sortOrder || row.sort_order || 0),
  };
}

function mapAdminUser(row: Record<string, unknown>): AdminUser {
  return {
    id: Number(row.id),
    login: String(row.login || ""),
    name: String(row.name || ""),
    isActive: Boolean(row.isActive ?? row.is_active),
    createdAt: String(row.createdAt || row.created_at || ""),
    updatedAt: String(row.updatedAt || row.updated_at || ""),
    lastLoginAt: row.lastLoginAt || row.last_login_at ? String(row.lastLoginAt || row.last_login_at) : null,
  };
}

function mapAdminUserRecord(row: Record<string, unknown>): AdminUserRecord {
  return {
    ...mapAdminUser(row),
    passwordHash: String(row.passwordHash || row.password_hash || ""),
  };
}

const adminUserSelect = `
  SELECT
    id,
    login,
    name,
    is_active AS "isActive",
    password_hash AS "passwordHash",
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    last_login_at AS "lastLoginAt"
  FROM admin_users
`;

export async function listAdminUsers() {
  await ensureAdminUsersTable();

  const result = await getDb().query(`${adminUserSelect} ORDER BY id ASC`);

  return result.rows.map(mapAdminUser);
}

export async function getAdminUserById(id: number) {
  await ensureAdminUsersTable();

  const result = await getDb().query(`${adminUserSelect} WHERE id = $1`, [id]);

  return result.rows[0] ? mapAdminUserRecord(result.rows[0]) : null;
}

export async function getAdminUserByLogin(login: string) {
  await ensureAdminUsersTable();

  const result = await getDb().query(`${adminUserSelect} WHERE LOWER(login) = LOWER($1) AND is_active = TRUE`, [login]);

  return result.rows[0] ? mapAdminUserRecord(result.rows[0]) : null;
}

export async function authenticateAdminUser(login: string, password: string) {
  const user = await getAdminUserByLogin(login);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  await getDb().query("UPDATE admin_users SET last_login_at = NOW() WHERE id = $1", [user.id]);

  return mapAdminUser(user);
}

export async function createAdminUser(input: AdminUserInput) {
  await ensureAdminUsersTable();

  if (!input.passwordHash) {
    throw new Error("Password hash is required for a new admin user.");
  }

  await getDb().query(
    `
      INSERT INTO admin_users (login, name, password_hash, is_active)
      VALUES ($1, $2, $3, $4)
    `,
    [input.login, input.name, input.passwordHash, input.isActive],
  );
}

export async function updateAdminUser(id: number, input: AdminUserInput) {
  await ensureAdminUsersTable();

  const current = await getDb().query("SELECT is_active FROM admin_users WHERE id = $1", [id]);

  if (!current.rows[0]) {
    return;
  }

  if (current.rows[0].is_active && !input.isActive) {
    const activeCount = await getDb().query("SELECT COUNT(*)::int AS count FROM admin_users WHERE is_active = TRUE");

    if (Number(activeCount.rows[0]?.count || 0) <= 1) {
      throw new Error("Cannot deactivate the last active admin user.");
    }
  }

  if (input.passwordHash) {
    await getDb().query(
      `
        UPDATE admin_users
        SET login = $2, name = $3, password_hash = $4, is_active = $5, updated_at = NOW()
        WHERE id = $1
      `,
      [id, input.login, input.name, input.passwordHash, input.isActive],
    );

    return;
  }

  await getDb().query(
    `
      UPDATE admin_users
      SET login = $2, name = $3, is_active = $4, updated_at = NOW()
      WHERE id = $1
    `,
    [id, input.login, input.name, input.isActive],
  );
}

export async function deleteAdminUser(id: number) {
  await ensureAdminUsersTable();

  const current = await getDb().query("SELECT is_active FROM admin_users WHERE id = $1", [id]);

  if (!current.rows[0]) {
    return;
  }

  if (current.rows[0].is_active) {
    const activeCount = await getDb().query("SELECT COUNT(*)::int AS count FROM admin_users WHERE is_active = TRUE");

    if (Number(activeCount.rows[0]?.count || 0) <= 1) {
      throw new Error("Cannot delete the last active admin user.");
    }
  }

  await getDb().query("DELETE FROM admin_users WHERE id = $1", [id]);
}
export async function listProjectCategories() {
  await ensureProjectCategoriesTable();

  const result = await getDb().query(`
    SELECT id, name, slug, description, sort_order AS "sortOrder"
    FROM project_categories
    ORDER BY sort_order ASC, id ASC
  `);

  return result.rows.map(mapCategory);
}

export async function createProjectCategory(input: ProjectCategoryInput) {
  await ensureProjectCategoriesTable();

  await getDb().query(
    `
      INSERT INTO project_categories (name, slug, description, sort_order)
      VALUES ($1, $2, $3, $4)
    `,
    [input.name, input.slug, input.description, input.sortOrder],
  );
}

export async function updateProjectCategory(id: number, input: ProjectCategoryInput) {
  await ensureProjectCategoriesTable();

  const current = await getDb().query("SELECT slug FROM project_categories WHERE id = $1", [id]);
  const previousSlug = String(current.rows[0]?.slug || "");

  await getDb().query(
    `
      UPDATE project_categories
      SET name = $2, slug = $3, description = $4, sort_order = $5, updated_at = NOW()
      WHERE id = $1
    `,
    [id, input.name, input.slug, input.description, input.sortOrder],
  );

  if (previousSlug && previousSlug !== input.slug) {
    await getDb().query("UPDATE company_work_items SET category_slug = $2, category = $3 WHERE category_slug = $1", [previousSlug, input.slug, input.name]);
  }
}

export async function deleteProjectCategory(id: number) {
  await ensureProjectCategoriesTable();

  const current = await getDb().query("SELECT slug FROM project_categories WHERE id = $1", [id]);
  const slug = String(current.rows[0]?.slug || "");

  if (slug) {
    await getDb().query("UPDATE company_work_items SET category_slug = 'sites' WHERE category_slug = $1", [slug]);
  }

  await getDb().query("DELETE FROM project_categories WHERE id = $1", [id]);
}

const workSelect = `
  SELECT
    id,
    slug,
    title,
    summary,
    project_text AS "projectText",
    category,
    category_slug AS "categorySlug",
    time_taken AS "timeTaken",
    image,
    detail_image AS "detailImage",
    image_alt AS "imageAlt",
    technologies,
    team_members AS "teamMembers",
    cta_label AS "ctaLabel",
    sort_order AS "sortOrder"
  FROM company_work_items
`;

export async function listCompanyWorkItems() {
  await ensureCompanyWorkTable();

  const result = await getDb().query(`${workSelect} ORDER BY sort_order ASC, id ASC`);

  return result.rows.map(mapCompanyWork);
}

export async function listLatestCompanyWorkItems(limit = 3) {
  await ensureCompanyWorkTable();

  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 12);
  const result = await getDb().query(`${workSelect} ORDER BY created_at DESC, id DESC LIMIT $1`, [safeLimit]);

  return result.rows.map(mapCompanyWork);
}

export async function getCompanyWorkItem(id: number) {
  await ensureCompanyWorkTable();

  const result = await getDb().query(`${workSelect} WHERE id = $1`, [id]);

  return result.rows[0] ? mapCompanyWork(result.rows[0]) : null;
}

export async function getCompanyWorkItemBySlug(slug: string) {
  await ensureCompanyWorkTable();

  const result = await getDb().query(`${workSelect} WHERE slug = $1`, [slug]);

  return result.rows[0] ? mapCompanyWork(result.rows[0]) : null;
}

export async function createCompanyWorkItem(input: CompanyWorkInput) {
  await ensureCompanyWorkTable();

  await getDb().query(
    `
      INSERT INTO company_work_items (
        slug,
        title,
        summary,
        project_text,
        category,
        category_slug,
        time_taken,
        image,
        detail_image,
        image_alt,
        technologies,
        team_members,
        cta_label,
        sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14)
    `,
    [
      input.slug,
      input.title,
      input.summary,
      input.projectText,
      input.category,
      input.categorySlug,
      input.timeTaken,
      input.image,
      input.detailImage,
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
        slug = $2,
        title = $3,
        summary = $4,
        project_text = $5,
        category = $6,
        category_slug = $7,
        time_taken = $8,
        image = $9,
        detail_image = $10,
        image_alt = $11,
        technologies = $12,
        team_members = $13::jsonb,
        cta_label = $14,
        sort_order = $15,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      input.slug,
      input.title,
      input.summary,
      input.projectText,
      input.category,
      input.categorySlug,
      input.timeTaken,
      input.image,
      input.detailImage,
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
async function ensureMediaAssetsTable() {
  await getDb().query(`
    CREATE TABLE IF NOT EXISTS media_assets (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      content BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await getDb().query("CREATE INDEX IF NOT EXISTS media_assets_created_at_idx ON media_assets (created_at DESC)");
}

function mapMediaAsset(row: Record<string, unknown>): MediaAsset {
  const id = Number(row.id);

  return {
    id,
    fileName: String(row.fileName || row.file_name || "image"),
    mimeType: String(row.mimeType || row.mime_type || "application/octet-stream"),
    sizeBytes: Number(row.sizeBytes || row.size_bytes || 0),
    src: `/api/media/${id}`,
    createdAt: String(row.createdAt || row.created_at || ""),
  };
}

function mapMediaAssetRecord(row: Record<string, unknown>): MediaAssetRecord {
  const content = Buffer.isBuffer(row.content) ? row.content : Buffer.from([]);

  return {
    ...mapMediaAsset(row),
    content,
  };
}

const mediaAssetSelect = `
  SELECT
    id,
    file_name AS "fileName",
    mime_type AS "mimeType",
    size_bytes AS "sizeBytes",
    created_at AS "createdAt"
  FROM media_assets
`;

export async function listMediaAssets() {
  await ensureMediaAssetsTable();

  const result = await getDb().query(`${mediaAssetSelect} ORDER BY created_at DESC, id DESC`);

  return result.rows.map(mapMediaAsset);
}

export async function getMediaAsset(id: number) {
  await ensureMediaAssetsTable();

  const result = await getDb().query(
    `
      SELECT
        id,
        file_name AS "fileName",
        mime_type AS "mimeType",
        size_bytes AS "sizeBytes",
        content,
        created_at AS "createdAt"
      FROM media_assets
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ? mapMediaAssetRecord(result.rows[0]) : null;
}

export async function createMediaAsset(input: MediaAssetInput) {
  await ensureMediaAssetsTable();

  const result = await getDb().query(
    `
      INSERT INTO media_assets (file_name, mime_type, size_bytes, content)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        file_name AS "fileName",
        mime_type AS "mimeType",
        size_bytes AS "sizeBytes",
        created_at AS "createdAt"
    `,
    [input.fileName, input.mimeType, input.sizeBytes, input.content],
  );

  return mapMediaAsset(result.rows[0]);
}

async function ensureQuizLeadsTable() {
  await getDb().query(`
    CREATE TABLE IF NOT EXISTS quiz_leads (
      id SERIAL PRIMARY KEY,
      project_type TEXT NOT NULL,
      budget TEXT NOT NULL,
      timeline TEXT NOT NULL,
      contact TEXT NOT NULL,
      source_path TEXT NOT NULL DEFAULT '/',
      status TEXT NOT NULL DEFAULT 'new',
      consent_version TEXT NOT NULL,
      consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await getDb().query("CREATE INDEX IF NOT EXISTS quiz_leads_created_at_idx ON quiz_leads (created_at DESC)");
  await getDb().query("CREATE INDEX IF NOT EXISTS quiz_leads_status_idx ON quiz_leads (status, created_at DESC)");
}

function mapQuizLead(row: Record<string, unknown>): QuizLead {
  return {
    id: Number(row.id),
    projectType: String(row.projectType || row.project_type || ""),
    budget: String(row.budget || ""),
    timeline: String(row.timeline || ""),
    contact: String(row.contact || ""),
    sourcePath: String(row.sourcePath || row.source_path || "/"),
    status: row.status === "processed" ? "processed" : "new",
    consentVersion: String(row.consentVersion || row.consent_version || ""),
    consentAt: String(row.consentAt || row.consent_at || ""),
    createdAt: String(row.createdAt || row.created_at || ""),
  };
}

const quizLeadSelect = `
  SELECT
    id,
    project_type AS "projectType",
    budget,
    timeline,
    contact,
    source_path AS "sourcePath",
    status,
    consent_version AS "consentVersion",
    consent_at AS "consentAt",
    created_at AS "createdAt"
  FROM quiz_leads
`;

export async function createQuizLead(input: QuizLeadInput) {
  await ensureQuizLeadsTable();

  const result = await getDb().query(
    `
      INSERT INTO quiz_leads (
        project_type,
        budget,
        timeline,
        contact,
        source_path,
        consent_version
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [input.projectType, input.budget, input.timeline, input.contact, input.sourcePath, input.consentVersion],
  );

  return Number(result.rows[0]?.id || 0);
}

export async function listQuizLeads() {
  await ensureQuizLeadsTable();

  const result = await getDb().query(`${quizLeadSelect} ORDER BY created_at DESC, id DESC`);

  return result.rows.map(mapQuizLead);
}

export async function updateQuizLeadStatus(id: number, status: QuizLeadStatus) {
  await ensureQuizLeadsTable();
  await getDb().query("UPDATE quiz_leads SET status = $2 WHERE id = $1", [id, status]);
}

export async function deleteQuizLead(id: number) {
  await ensureQuizLeadsTable();
  await getDb().query("DELETE FROM quiz_leads WHERE id = $1", [id]);
}
