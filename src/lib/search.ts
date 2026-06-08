import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Full-text product search using the MySQL FULLTEXT(name, description) index.
 * Returns matching product ids (active only). Falls back to [] on error so the
 * caller can use a LIKE fallback.
 */
export async function searchProductIds(query: string): Promise<string[]> {
  const tokens = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (tokens.length === 0) return [];

  // Require each token, allow prefix matches: "+sambar* +powder*"
  const booleanQuery = tokens.map((t) => `+${t}*`).join(" ");

  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM Product
      WHERE active = true
        AND MATCH(name, description) AGAINST(${booleanQuery} IN BOOLEAN MODE)
      ORDER BY MATCH(name, description) AGAINST(${booleanQuery} IN BOOLEAN MODE) DESC
      LIMIT 60
    `;
    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}
