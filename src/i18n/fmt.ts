/**
 * Fills {placeholders} in a translated string.
 *
 * Copy lives in the CMS, so every translated string has to stay a plain string —
 * a function could not be edited in the panel or stored as JSON.
 */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}
