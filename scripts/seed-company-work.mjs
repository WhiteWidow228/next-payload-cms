import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    let value = match[2].trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  }
}

loadLocalEnv();

const connectionString = process.env.DATABASE_URI || "postgres://postgres:123321@localhost:5432/core_devs_cms";

const works = [
  {
    title: "Фитнес-приложение Zenith",
    summary: "Мобильное приложение для фитнес-студии с программами тренировок, питанием и личным кабинетом клиента.",
    category: "Мобильное приложение",
    timeTaken: "9 месяцев",
    image: "/assets/work-zenith-clean.jpg",
    imageAlt: "Экраны фитнес-приложения Zenith",
    technologies: ["React Native", "Firebase", "Redux", "REST API", "MongoDB"],
    teamMembers: [1, 2, 3, 4, 5, 6].map((item) => ({ name: `Участник команды ${item}`, avatar: `/assets/avatar-${item}.png` })),
    ctaLabel: "Рассчитать смету",
    sortOrder: 0,
  },
  {
    title: "Интернет-магазин A-Aura",
    summary: "Редизайн интернет-магазина с новой визуальной системой, удобным каталогом и понятной покупкой.",
    category: "Дизайн и разработка сайта",
    timeTaken: "3 месяца",
    image: "/assets/work-aura-clean.jpg",
    imageAlt: "Экраны интернет-магазина A-Aura",
    technologies: ["WordPress", "PHP", "HTML5", "CSS3", "JavaScript"],
    teamMembers: [2, 3, 4, 5, 6, 1].map((item) => ({ name: `Участник команды ${item}`, avatar: `/assets/avatar-${item}.png` })),
    ctaLabel: "Рассчитать смету",
    sortOrder: 1,
  },
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query(`
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
      cta_label TEXT NOT NULL DEFAULT 'Рассчитать смету',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query("TRUNCATE company_work_items RESTART IDENTITY");

  for (const work of works) {
    await client.query(
      `INSERT INTO company_work_items (title, summary, category, time_taken, image, image_alt, technologies, team_members, cta_label, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)`,
      [work.title, work.summary, work.category, work.timeTaken, work.image, work.imageAlt, work.technologies, JSON.stringify(work.teamMembers), work.ctaLabel, work.sortOrder],
    );
  }

  const result = await client.query("SELECT id, title, sort_order FROM company_work_items ORDER BY sort_order, id");
  await client.end();
  console.log(JSON.stringify(result.rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
