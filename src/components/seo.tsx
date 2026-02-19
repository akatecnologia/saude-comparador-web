import { Helmet } from "react-helmet-async";

const SITE_NAME = "SaudeComparador";
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
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
