import * as cheerio from 'cheerio';

export async function fetchRecipeContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Laden der URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, navigation, ads
  $('script, style, nav, header, footer, aside, iframe, noscript, .ad, .advertisement, .cookie-banner').remove();

  // Try to find recipe-specific content using common selectors
  const recipeSelectors = [
    '[itemtype*="Recipe"]',
    '[itemtype*="recipe"]',
    '.recipe',
    '#recipe',
    '.recipe-content',
    '.recipe-container',
    '[class*="recipe"]',
    'article',
    'main',
    '.post-content',
    '.entry-content',
  ];

  for (const selector of recipeSelectors) {
    const element = $(selector).first();
    if (element.length) {
      const content = element.text().trim();
      // Check if content is substantial
      if (content.length > 200) {
        return cleanText(content);
      }
    }
  }

  // Fallback to body text
  return cleanText($('body').text());
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .substring(0, 10000);
}
