import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  const fromEnv = Constants.expoConfig?.extra?.apiUrl;
  if (fromEnv) return fromEnv;

  const hostUri: string | undefined =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.expoGoConfig as any)?.developer?.host;

  if (hostUri) {
    const lanIp = hostUri.split(':')[0];
    if (lanIp && lanIp !== 'localhost' && lanIp !== '127.0.0.1') {
      return `http://${lanIp}:3001`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

const ENV = {
  apiUrl: resolveApiUrl(),
};

export default ENV;
