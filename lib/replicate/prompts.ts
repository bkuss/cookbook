export const RECIPE_EXTRACTION_PROMPT = `Du bist ein Experte für das Extrahieren von Rezeptinformationen. Analysiere den gegebenen Inhalt und extrahiere das Rezept als JSON-Objekt.

Gib NUR gültiges JSON zurück, ohne zusätzlichen Text. Das JSON muss folgendes Format haben:

{
  "title": "Name des Rezepts",
  "servings": 4,
  "ingredients": [
    {"name": "Zutatname", "amount": 200, "unit": "g"},
    {"name": "Salz", "amount": null, "unit": "nach Geschmack"}
  ],
  "instructions": "Schritt 1\\nSchritt 2\\nSchritt 3"
}

Regeln:
- Extrahiere genaue Mengen wenn möglich
- Verwende metrische Einheiten (g, ml, EL, TL, Stück)
- Für "nach Geschmack" oder unbestimmte Mengen: amount = null
- Halte Zutatennamen einfach und klar
- Gib die Anleitung als einzelne Schritte zurück, getrennt durch Zeilenumbrüche (\\n)
- KEINE Nummerierung der Schritte, nur der Text pro Zeile
- Antworte NUR mit gültigem JSON`;

export const IMAGE_RECIPE_PROMPT = `${RECIPE_EXTRACTION_PROMPT}

Analysiere das Bild und extrahiere alle Rezeptinformationen die du erkennen kannst.`;

export const URL_RECIPE_PROMPT = `${RECIPE_EXTRACTION_PROMPT}

Hier ist der Inhalt der Webseite:`;
