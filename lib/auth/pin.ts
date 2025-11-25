import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(pin, salt, 64)) as Buffer;
  return salt + ':' + derivedKey.toString('hex');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = (await scryptAsync(pin, salt, 64)) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}
