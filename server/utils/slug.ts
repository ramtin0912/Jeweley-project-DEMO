/**
 * @file slug
 * @description Persian-aware slug helpers for admin CRUD.
 *
 * @status None
 * @issues None
 * @todo None
 */
export function slugifyFa(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
}

export async function makeUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = base
  let counter = 2
  while (await isTaken(slug)) {
    slug = `${base}-${counter}`
    counter++
  }
  return slug
}
