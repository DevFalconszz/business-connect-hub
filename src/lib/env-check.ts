import { isLocalServerRunning } from './opencode-api';

export type EnvMode = 'local' | 'online';

let _mode: EnvMode | null = null;

export async function detectEnv(): Promise<EnvMode> {
  if (_mode) return _mode;

  const localRunning = await isLocalServerRunning();
  _mode = localRunning ? 'local' : 'online';
  return _mode;
}

export function getEnv(): EnvMode {
  return _mode || 'online';
}

export function isLocal(): boolean {
  return _mode === 'local';
}

export function isOnline(): boolean {
  return _mode !== 'local';
}
