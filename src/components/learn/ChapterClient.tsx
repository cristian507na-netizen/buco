"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Module, Chapter } from "@/lib/learn-content";
import { CHAPTER_CONTENT } from "@/lib/chapter-content";
import { markChapterComplete } from "@/app/learn/actions";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BookOpen,
} from "lucide-react";

interface Props {
  module: Module;
  chapter: Chapter;
  chapterIndex: number;
  nextChapter: Chapter | null;
  isCompleted: boolean;
  userData: any;
}

export default function ChapterClient({ module: mod, chapter, chapterIndex, nextChapter, isCompleted: initialCompleted, userData }: Props) {
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted);
  const [marking, setMarking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const content = CHAPTER_CONTENT[chapter.id];

  // Reading progress bar
  useEffect(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.round((window.scrollY / docHeight) * 100)) : 0;
      setScrollProgress(pct);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleMarkComplete() {
    if (completed || marking) return;
    setMarking(true);
    try {
      await markChapterComplete(mod.id, chapter.id);
      setCompleted(true);
      setShowSuccess(true);
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  }

  async function fetchAiAnalysis() {
    if (!userData) return;
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/learn/ai-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, userData }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.analysis);
      }
    } catch {
      setAiAnalysis("Error al cargar el análisis. Intenta de nuevo.");
    } finally {
      setLoadingAi(false);
    }
  }

  useEffect(() => {
    if (chapter.hasAiSection && userData) fetchAiAnalysis();
  }, [chapter.id]);

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-[999] h-[3px] bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
        {/* HEADER */}
        <div
          className="section-hero min-h-[130px] py-6 px-6 relative"
          style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: "hidden" }}
        >
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 flex flex-col gap-3">
            <Link href={`/learn/${mod.slug}`} className="flex items-center gap-1.5 text-white/70 text-xs font-bold hover:text-white transition-colors w-fit">
              <ChevronLeft className="w-4 h-4" />
              {mod.icon} {mod.title}
            </Link>
            <h1 className="text-xl font-black text-white leading-tight">{chapter.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-[11px] font-bold">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{chapter.estimatedMinutes} min de lectura</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />Cap. {chapterIndex + 1} de {mod.chapters.length}</span>
              {chapter.hasAiSection && <span className="flex items-center gap-1 text-purple-300"><Sparkles className="w-3.5 h-3.5" />IA incluida</span>}
            </div>
            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap">
              {chapter.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 rounded-full text-[9px] font-bold uppercase tracking-wider">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div ref={contentRef} className="max-w-3xl mx-auto px-4 py-8 space-y-10">

          {content ? (
            <>
              {/* A. INTRO */}
              {content.intro && (
                <section className="space-y-3">
                  <div className="prose prose-sm max-w-none text-[var(--text-primary)]">
                    {content.intro.map((p, i) => (
                      <p key={i} className="text-base leading-relaxed text-[var(--text-secondary)]">{p}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* B. CONCEPTO PRINCIPAL */}
              {content.concept && (
                <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-3">
                  <h2 className="font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
                    <span className="text-2xl">💡</span> El concepto
                  </h2>
                  {content.concept.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-[var(--text-secondary)]">{p}</p>
                  ))}
                </section>
              )}

              {/* C. VISUAL */}
              {content.visual && (
                <section>
                  <content.visual />
                </section>
              )}

              {/* D. EJEMPLO PRÁCTICO */}
              {content.example && (
                <section className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 space-y-3">
                  <h2 className="font-black text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="text-xl">📊</span> Ejemplo práctico
                  </h2>
                  {content.example.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">{p}</p>
                  ))}
                </section>
              )}

              {/* E. CITA */}
              {chapter.quote && (
                <section className="relative px-6 py-8 bg-[var(--bg-card)] rounded-2xl border-l-4 border-primary">
                  <p className="text-xl font-black text-[var(--text-primary)] leading-relaxed italic mb-3">
                    "{chapter.quote.text}"
                  </p>
                  <p className="text-sm font-bold text-[var(--text-muted)]">— {chapter.quote.author}</p>
                </section>
              )}

              {/* F. APLÍCALO EN BUCO */}
              {content.applyInBuco && (
                <section className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 space-y-3">
                  <h2 className="font-black text-base text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <span className="text-xl">🎯</span> Aplícalo en Buco
                  </h2>
                  <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">{content.applyInBuco.text}</p>
                  {content.applyInBuco.link && (
                    <Link
                      href={content.applyInBuco.link}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                    >
                      {content.applyInBuco.linkLabel || "Ir a Buco"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </section>
              )}

              {/* G. RESUMEN */}
              {chapter.summary && (
                <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
                  <h2 className="font-black text-base text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span className="text-xl">📝</span> Resumen — 3 puntos clave
                  </h2>
                  <ul className="space-y-3">
                    {chapter.summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            /* Fallback for chapters without content yet */
            <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 text-center space-y-4">
              <span className="text-5xl">{mod.icon}</span>
              <h2 className="font-black text-xl text-[var(--text-primary)]">{chapter.title}</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                Este capítulo está en camino. Mientras tanto, usa los conceptos del resumen de abajo como guía.
              </p>
              {chapter.quote && (
                <blockquote className="border-l-4 border-primary pl-4 text-left">
                  <p className="italic text-[var(--text-primary)] font-medium">"{chapter.quote.text}"</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">— {chapter.quote.author}</p>
                </blockquote>
              )}
              <ul className="text-left space-y-2 mt-4">
                {chapter.summary.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-primary font-black shrink-0">{i + 1}.</span>{s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* H. SECCIÓN IA PERSONALIZADA */}
          {chapter.hasAiSection && (
            <section className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-200" />
                  <h2 className="font-black text-base">Tu situación actual</h2>
                </div>
                <button
                  onClick={fetchAiAnalysis}
                  disabled={loadingAi}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-200 hover:text-white transition-colors"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", loadingAi && "animate-spin")} />
                  Actualizar
                </button>
              </div>
              {loadingAi ? (
                <div className="space-y-2">
                  <div className="h-4 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 bg-white/20 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-white/20 rounded animate-pulse w-2/3" />
                </div>
              ) : aiAnalysis ? (
                <div className="text-sm leading-relaxed text-purple-50 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-ul:text-purple-50 prose-ol:text-purple-50">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-purple-200">Registra algunos gastos en Buco para recibir tu análisis personalizado.</p>
              )}
            </section>
          )}

          {/* BARRA DE COMPLETAR */}
          <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2">
                <span>Progreso de lectura</span>
                <span>{scrollProgress}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            {!completed ? (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="w-5 h-5" />
                {marking ? "Guardando..." : "✅ Marcar como completada"}
              </button>
            ) : (
              <div className="space-y-4">
                {showSuccess && (
                  <div className="text-center space-y-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-2xl">🎉</p>
                    <p className="font-black text-emerald-700 dark:text-emerald-300">¡Excelente!</p>
                    {nextChapter ? (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
                        Has dominado este concepto. En el siguiente capítulo aprenderás sobre <strong>{nextChapter.title}</strong>. ¿Listo?
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        ¡Completaste el módulo <strong>{mod.title}</strong>! 🏆
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Lección completada</p>
                </div>
              </div>
            )}
          </section>

          {/* NAVEGACIÓN siguiente/anterior */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {chapterIndex > 0 ? (
              <Link
                href={`/learn/${mod.slug}/${mod.chapters[chapterIndex - 1].slug}`}
                className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] hover:border-primary/30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Link>
            ) : <div />}

            {nextChapter ? (
              <Link
                href={`/learn/${mod.slug}/${nextChapter.slug}`}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20 ml-auto"
              >
                Siguiente capítulo
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/learn/${mod.slug}`}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 ml-auto"
              >
                Ver módulo
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
