import { query } from '../connection';

interface SettingRow {
  id: number;
  key: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await query<SettingRow>(
    'SELECT value FROM recipes_app_settings WHERE key = $1',
    [key]
  );
  return result.rows.length > 0 ? result.rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO recipes_app_settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, value]
  );
}

export async function isPinConfigured(): Promise<boolean> {
  const pin = await getSetting('pin_hash');
  return pin !== null;
}
