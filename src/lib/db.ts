import { Pool, type PoolConfig } from "pg";

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
  category: string;
  categorySlug: string;
  timeTaken: string;
  image: string;
  imageAlt: string;
  technologies: string[];
  teamMembers: TeamMember[];
  ctaLabel: string;
  sortOrder: number;
};

export type CompanyWorkInput = Omit<CompanyWorkItem, "id">;

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
    return `Database env variable is missing in Vercel. Add one of: ${DATABASE_ENV_KEYS.join(", ")}.`;
  }

  if (lowerMessage.includes("password authentication failed") || lowerMessage.includes("authentication failed")) {
    return "Postgres rejected the login or password. Check the current Neon connection string in Vercel variables.";
  }

  if (lowerMessage.includes("enotfound") || lowerMessage.includes("getaddrinfo")) {
    return "Vercel could not resolve the Postgres host. Check that the connection string is copied completely.";
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
    category: String(row.category || ""),
    categorySlug: String(row.categorySlug || row.category_slug || "sites"),
    timeTaken: String(row.timeTaken || row.time_taken || ""),
    image: String(row.image || ""),
    imageAlt: String(row.imageAlt || row.image_alt || ""),
    technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [],
    teamMembers: normalizeTeamMembers(row.teamMembers || row.team_members),
    ctaLabel: String(row.ctaLabel || row.cta_label || DEFAULT_CTA_LABEL),
    sortOrder: Number(row.sortOrder || row.sort_order || 0),
  };
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
    category,
    category_slug AS "categorySlug",
    time_taken AS "timeTaken",
    image,
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
        category,
        category_slug,
        time_taken,
        image,
        image_alt,
        technologies,
        team_members,
        cta_label,
        sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
    `,
    [
      input.slug,
      input.title,
      input.summary,
      input.category,
      input.categorySlug,
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
        slug = $2,
        title = $3,
        summary = $4,
        category = $5,
        category_slug = $6,
        time_taken = $7,
        image = $8,
        image_alt = $9,
        technologies = $10,
        team_members = $11::jsonb,
        cta_label = $12,
        sort_order = $13,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      input.slug,
      input.title,
      input.summary,
      input.category,
      input.categorySlug,
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