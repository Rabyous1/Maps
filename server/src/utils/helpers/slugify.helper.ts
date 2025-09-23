// src/utils/helpers/slugify.helper.ts

export function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD") // supprime les accents
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  