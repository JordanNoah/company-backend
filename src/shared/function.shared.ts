import argon2 from 'argon2';

// Hash
export async function hashPassword(plain: string): Promise<string> {
  return await argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,    // 64 MB
    timeCost: 3,            // 3 iteraciones
    parallelism: 1,         // hilos
  });
}

// Verificación
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return await argon2.verify(hash, plain);
}