"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AnswerKey = "projectType" | "budget" | "timeline";

type QuizAnswers = Record<AnswerKey, string> & {
  contact: string;
};

type QuizQuestion = {
  key: AnswerKey;
  title: string;
  description: string;
  options: Array<{ value: string; label: string; hint: string }>;
};

const CONSENT_VERSION = "2026-07-13";

const questions: QuizQuestion[] = [
  {
    key: "projectType",
    title: "Что нужно разработать?",
    description: "Выберите ближайший формат. Детали уточним после заявки.",
    options: [
      { value: "landing", label: "Лендинг", hint: "Одностраничный сайт для продаж" },
      { value: "corporate", label: "Корпоративный сайт", hint: "Компания, услуги и заявки" },
      { value: "ecommerce", label: "Интернет-магазин", hint: "Каталог, корзина и оплата" },
      { value: "web-app", label: "Веб-приложение", hint: "Кабинет, CRM или сервис" },
      { value: "telegram-bot", label: "Telegram-бот", hint: "Продажи и автоматизация" },
      { value: "design", label: "Дизайн", hint: "Интерфейс или редизайн" },
    ],
  },
  {
    key: "budget",
    title: "Какой бюджет планируете?",
    description: "Это поможет сразу предложить подходящий объём работ.",
    options: [
      { value: "up-to-50", label: "До 50 000 ₽", hint: "Быстрый запуск или небольшой проект" },
      { value: "50-100", label: "50 000–100 000 ₽", hint: "Сайт с индивидуальным дизайном" },
      { value: "100-250", label: "100 000–250 000 ₽", hint: "Разработка с интеграциями" },
      { value: "250-plus", label: "От 250 000 ₽", hint: "Сложный продукт или сервис" },
      { value: "need-estimate", label: "Нужна оценка", hint: "Подберём решение под задачу" },
    ],
  },
  {
    key: "timeline",
    title: "Когда нужен результат?",
    description: "Срок влияет на состав команды и этапы запуска.",
    options: [
      { value: "asap", label: "Как можно скорее", hint: "Приоритетный запуск" },
      { value: "one-month", label: "В течение месяца", hint: "Оптимальный темп для сайта" },
      { value: "two-three-months", label: "За 2–3 месяца", hint: "Для сложной разработки" },
      { value: "flexible", label: "Срок гибкий", hint: "Сфокусируемся на качестве" },
    ],
  },
];

function isValidContact(value: string) {
  const contact = value.trim();
  const phoneDigits = contact.replace(/\D/g, "");
  const telegram = /^@?[a-zA-Z0-9_]{5,32}$/.test(contact) || /^https?:\/\/(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?$/i.test(contact);

  return phoneDigits.length >= 10 || telegram;
}

export function ProjectQuiz() {
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    projectType: "",
    budget: "",
    timeline: "",
    contact: "",
  });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isContactStep = step === questions.length;
  const currentQuestion = questions[step];
  const progress = ((step + 1) / (questions.length + 1)) * 100;
  const canContinue = useMemo(() => {
    if (isContactStep) {
      return isValidContact(answers.contact) && consent;
    }

    return Boolean(currentQuestion && answers[currentQuestion.key]);
  }, [answers, consent, currentQuestion, isContactStep]);

  function chooseAnswer(key: AnswerKey, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function submitQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isContactStep) {
      if (canContinue) {
        setStep((current) => Math.min(current + 1, questions.length));
      }
      return;
    }

    if (!canContinue || submitting) {
      setError("Укажите корректный номер телефона или Telegram и подтвердите согласие.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/quiz-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          sourcePath: pathname,
          consent,
          consentVersion: CONSENT_VERSION,
          website,
        }),
      });

      if (!response.ok) {
        throw new Error("Lead request failed");
      }

      setSubmitted(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mt-[50px] overflow-hidden rounded-[18px] border border-cyan-300/20 bg-[#10191b]" id="quiz">
        <div className="grid min-h-[430px] place-items-center px-6 py-14 text-center sm:px-10">
          <div className="animate-fade-up max-w-2xl">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#13c9e8] text-2xl font-black text-[#071012] shadow-[0_0_45px_rgba(19,201,232,0.35)]">✓</span>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Заявка принята</p>
            <h2 className="mt-4 text-3xl font-black uppercase text-white sm:text-5xl">Спасибо! Скоро свяжемся</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55">
              Изучим ответы и подготовим предварительную оценку проекта. Обычно отвечаем в течение рабочего дня.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-[50px] overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="quiz">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-white/5 bg-[#13c9e8] px-7 pb-8 pt-[50px] text-[#071012] sm:px-10 lg:border-b-0 lg:border-r lg:border-black/10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#07505c]">Быстрая оценка проекта</p>
          <h2 className="mt-5 text-4xl font-black uppercase leading-none sm:text-5xl">Ответьте на 3 вопроса</h2>
          <p className="mt-6 max-w-md text-sm leading-6 text-[#08343b]/75">
            Получим вводные без длинного брифа и предложим подходящий формат разработки.
          </p>
          <div className="mt-10">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span>Шаг {step + 1} из {questions.length + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#071012]/15">
              <div className="h-full rounded-full bg-[#071012] transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <form className="relative flex min-h-[500px] flex-col px-6 pb-7 pt-[50px] sm:px-10 sm:pb-10" onSubmit={submitQuiz}>
          <input name="website" onChange={(event) => setWebsite(event.target.value)} type="hidden" value={website} />

          <div className="flex-1" key={step}>
            {currentQuestion ? (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-black uppercase text-white sm:text-3xl">{currentQuestion.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{currentQuestion.description}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option) => {
                    const selected = answers[currentQuestion.key] === option.value;

                    return (
                      <button
                        aria-pressed={selected}
                        className={`min-h-24 rounded-[10px] border p-5 text-left transition duration-300 ${
                          selected
                            ? "border-cyan-300 bg-cyan-300/10 shadow-[inset_0_0_0_1px_rgba(19,201,232,0.2)]"
                            : "border-white/8 bg-[#171717] hover:-translate-y-0.5 hover:border-cyan-300/35"
                        }`}
                        key={option.value}
                        onClick={() => chooseAnswer(currentQuestion.key, option.value)}
                        type="button"
                      >
                        <span className={`text-sm font-black uppercase ${selected ? "text-cyan-300" : "text-white"}`}>{option.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-white/40">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="animate-fade-up max-w-2xl">
                <h3 className="text-2xl font-black uppercase text-white sm:text-3xl">Куда отправить оценку?</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">Оставьте телефон или имя пользователя в Telegram.</p>
                <label className="mt-8 block text-xs font-black uppercase text-white/60" htmlFor="quiz-contact">
                  Телефон или Telegram
                </label>
                <input
                  autoComplete="tel"
                  className="mt-3 h-15 w-full rounded-[10px] border border-white/10 bg-[#171717] px-5 text-base text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
                  id="quiz-contact"
                  inputMode="tel"
                  maxLength={100}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, contact: event.target.value }));
                    setError("");
                  }}
                  placeholder="+7 999 000-00-00 или @username"
                  value={answers.contact}
                />
                <div className="mt-6 flex items-start gap-3 rounded-[10px] border border-white/7 bg-white/[0.025] p-4">
                  <input
                    checked={consent}
                    className="mt-0.5 size-5 shrink-0 accent-[#13c9e8]"
                    id="quiz-consent"
                    onChange={(event) => {
                      setConsent(event.target.checked);
                      setError("");
                    }}
                    type="checkbox"
                  />
                  <label className="text-xs leading-5 text-white/50" htmlFor="quiz-consent">
                    Я даю <Link className="text-cyan-300 underline underline-offset-2" href="/personal-data-consent">согласие на обработку персональных данных</Link> и принимаю <Link className="text-cyan-300 underline underline-offset-2" href="/privacy">политику конфиденциальности</Link>.
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-white/5 pt-6">
            <p aria-live="polite" className="mb-4 min-h-5 text-sm text-red-300">{error}</p>
            <div className="flex items-center justify-between gap-3">
              <button
                className="h-12 rounded-lg border border-white/10 px-5 text-xs font-black uppercase text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                disabled={step === 0 || submitting}
                onClick={() => {
                  setStep((current) => Math.max(0, current - 1));
                  setError("");
                }}
                type="button"
              >
                ← Назад
              </button>
              <button
                className="h-12 min-w-36 rounded-lg bg-[#13c9e8] px-6 text-xs font-black uppercase text-[#071012] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                disabled={!canContinue || submitting}
                type="submit"
              >
                {isContactStep ? (submitting ? "Отправляем..." : "Получить оценку") : "Далее →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
