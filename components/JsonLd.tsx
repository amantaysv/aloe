/**
 * JSON.stringify does not escape `<`, so a value containing `</script>` would close this tag and
 * inject arbitrary markup — product name/description/seo_text and category names all come from
 * the database. The unicode escapes stay valid inside a JSON string, so nothing else changes.
 */
function safeJson(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />;
}
