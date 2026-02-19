import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import SEO from "@/components/seo";
import ShareButton from "@/components/share-button";

interface BlogPostFull {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  published_at: string | null;
  tags: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || "";

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

function estimateReadTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Simple markdown-to-HTML converter for blog posts.
 * Handles headings, bold, italic, links, lists, code blocks, and paragraphs.
 */
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (```...```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-4"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary-dark underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-gray-600 my-4">$1</blockquote>');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(
    /(<li class="ml-4">[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ul class="list-disc my-3 space-y-1">${match}</ul>`,
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ol class="list-decimal my-3 space-y-1">${match}</ol>`,
  );

  // Wrap remaining lines in paragraphs
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr")
      ) {
        return trimmed;
      }
      return `<p class="text-gray-700 leading-relaxed mb-4">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${BASE_URL}/api/v1/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setPost)
      .catch(() => {
        setNotFound(true);
        setPost(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-8 w-3/4 mb-4" />
        <div className="skeleton h-4 w-1/2 mb-8" />
        <div className="space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Post não encontrado
        </h1>
        <p className="text-gray-500 mb-6">
          O artigo que você procura não existe ou ainda não foi publicado.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o blog
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);
  const contentHtml = markdownToHtml(post.content);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={post.title}
        description={post.meta_description || post.summary}
        canonical={`/blog/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.meta_description || post.summary,
          author: {
            "@type": "Person",
            name: post.author,
          },
          datePublished: post.published_at,
          dateModified: post.updated_at,
        }}
      />

      {/* Back link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o blog
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
        <span className="flex items-center gap-1">
          <User className="h-4 w-4" />
          {post.author}
        </span>
        {post.published_at && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readTime} min de leitura
        </span>
        <ShareButton
          variant="icon"
          url={`/blog/${post.slug}`}
          title={post.title}
        />
      </div>

      {/* Tags */}
      {post.tags && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {post.tags.split(",").map((tag) => (
            <span
              key={tag.trim()}
              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-light text-primary"
            >
              <Tag className="h-3 w-3" />
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
