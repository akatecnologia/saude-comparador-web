import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { BookOpen, Calendar, Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import SEO from "@/components/seo";
import { cn } from "@/lib/utils";

interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  author: string;
  published_at: string | null;
  tags: string;
  created_at: string;
}

interface BlogListResponse {
  items: BlogPostItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const BASE_URL = import.meta.env.VITE_API_URL || "";

function estimateReadTime(summary: string): number {
  // Rough estimate: average blog post with summary of N chars is ~5 min
  const wordCount = summary.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 40));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/v1/blog?page=${page}&limit=9`)
      .then((res) => res.json())
      .then(setData)
      .catch(() =>
        setData({ items: [], total: 0, page: 1, limit: 9, pages: 0 }),
      )
      .finally(() => setLoading(false));
  }, [page]);

  function goToPage(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Blog"
        description="Artigos e dicas sobre planos de saúde, operadoras, direitos do consumidor e mais."
        canonical="/blog"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Blog
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Artigos e dicas sobre planos de saúde, operadoras e direitos do
          consumidor
        </p>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-4 w-16 rounded-md" />
                <div className="skeleton h-4 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow animate-fade-in"
            >
              <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                {post.summary}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {estimateReadTime(post.summary)} min de leitura
                </span>
              </div>

              {post.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.split(",").map((tag) => (
                    <span
                      key={tag.trim()}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Nenhum artigo publicado ainda
          </h3>
          <p className="text-gray-500 text-sm">
            Em breve publicaremos conteúdo sobre planos de saúde.
          </p>
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page <= 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Pagina {page} de {data.pages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= data.pages}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page >= data.pages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
