import { Helmet } from "react-helmet-async";

const SITE_NAME = "SaudeComparador";
const SITE_URL = "https://saudecomparador.com.br";
const DEFAULT_OG_IMAGE = "/og-image.png";

type Props = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
};

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  jsonLd,
}: Props) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Compare planos de saúde com dados reais`;
  const metaDescription =
    description ||
    "Compare planos de saúde com dados reais da ANS. Ranking de operadoras, reajustes, reclamações e mais.";
  const imagePath = ogImage || DEFAULT_OG_IMAGE;
  const absoluteImage = imagePath.startsWith("http")
    ? imagePath
    : `${SITE_URL}${imagePath}`;
  const absoluteCanonical = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${SITE_URL}${canonical}`
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={absoluteCanonical || SITE_URL} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Canonical URL */}
      {absoluteCanonical && (
        <link rel="canonical" href={absoluteCanonical} />
      )}

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
