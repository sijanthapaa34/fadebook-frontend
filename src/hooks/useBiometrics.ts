import { useState, useEffect, useCallback } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });
const CREDS_KEY = 'fadebook_bio_creds';

export type BiometryType = 'FaceID' | 'TouchID' | 'Biometrics' | null;
export interface SavedCreds { email: string; password: string; }

export const useBiometrics = () => {
  const [biometryType, setBiometryType] = useState<BiometryType>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasSavedCreds, setHasSavedCreds] = useState(false);

  const check = useCallback(async () => {
    try {
      const result = await rnBiometrics.isSensorAvailable();
      console.warn('[Bio] available=' + result.available + ' type=' + result.biometryType);
      setIsAvailable(result.available);
      setBiometryType(result.available ? (result.biometryType as BiometryType) : null);
      const stored = await AsyncStorage.getItem(CREDS_KEY);
      console.warn('[Bio] hasSavedCreds=' + !!stored);
      setHasSavedCreds(!!stored);
    } catch (e: any) {
      console.warn('[Bio] check error: ' + e?.message);
      setIsAvailable(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const saveCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(CREDS_KEY, JSON.stringify({ email, password }));
      setHasSavedCreds(true);
      console.warn('[Bio] credentials saved for ' + email);
      return true;
    } catch (e: any) {
      console.warn('[Bio] saveCredentials error: ' + e?.message);
      return false;
    }
  };

  const authenticateAndGetCredentials = async (): Promise<SavedCreds | null> => {
    try {
      const stored = await AsyncStorage.getItem(CREDS_KEY);
      if (!stored) {
        console.warn('[Bio] no stored creds found');
        return null;
      }
      const label =
        biometryType === BiometryTypes.FaceID ? 'Face ID' :
        biometryType === BiometryTypes.TouchID ? 'Touch ID' : 'Biometrics';

      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage: `Sign in with ${label}`,
        cancelButtonText: 'Cancel',
      });
      console.warn('[Bio] simplePrompt success=' + success + ' error=' + error);
      if (!success) return null;
      return JSON.parse(stored) as SavedCreds;
    } catch (e: any) {
      console.warn('[Bio] authenticate error: ' + e?.message);
      return null;
    }
  };

  const clearCredentials = async () => {
    await AsyncStorage.removeItem(CREDS_KEY);
    try { await rnBiometrics.deleteKeys(); } catch {}
    setHasSavedCreds(false);
  };

  const biometryLabel =
    biometryType === BiometryTypes.FaceID ? 'Face ID' :
    biometryType === BiometryTypes.TouchID ? 'Touch ID' : 'Biometrics';

  return { isAvailable, biometryType, biometryLabel, hasSavedCreds, saveCredentials, authenticateAndGetCredentials, clearCredentials, check };
};
