// WebAuthn hook for biometric login on web (Touch ID / Face ID via platform authenticator)
import { useState, useEffect } from 'react';

const RP_ID = window.location.hostname;
const CREDENTIAL_ID_KEY = 'webauthn_credential_id';
const STORED_EMAIL_KEY = 'webauthn_email';

const isSupported = () =>
  typeof window !== 'undefined' &&
  !!window.PublicKeyCredential &&
  !!navigator.credentials;

// Convert base64url string to Uint8Array
const base64urlToBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
};

// Convert ArrayBuffer to base64url string
const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const useWebAuthn = () => {
  const [supported, setSupported] = useState(false);
  const [hasCredential, setHasCredential] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isSupported());
    const credId = localStorage.getItem(CREDENTIAL_ID_KEY);
    const email = localStorage.getItem(STORED_EMAIL_KEY);
    setHasCredential(!!credId);
    setSavedEmail(email);
  }, []);

  // Register a new biometric credential tied to this device
  const register = async (email: string): Promise<boolean> => {
    if (!isSupported()) return false;
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'FadeBook Admin', id: RP_ID },
          user: { id: userId, name: email, displayName: email },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // device biometrics only
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      localStorage.setItem(CREDENTIAL_ID_KEY, bufferToBase64url(credential.rawId));
      localStorage.setItem(STORED_EMAIL_KEY, email);
      setHasCredential(true);
      setSavedEmail(email);
      return true;
    } catch {
      return false;
    }
  };

  // Authenticate using existing biometric credential — returns true if verified
  const authenticate = async (): Promise<boolean> => {
    if (!isSupported()) return false;
    const credId = localStorage.getItem(CREDENTIAL_ID_KEY);
    if (!credId) return false;

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: RP_ID,
          allowCredentials: [
            { type: 'public-key', id: base64urlToBuffer(credId) },
          ],
          userVerification: 'required',
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      return !!assertion;
    } catch {
      return false;
    }
  };

  const clear = () => {
    localStorage.removeItem(CREDENTIAL_ID_KEY);
    localStorage.removeItem(STORED_EMAIL_KEY);
    setHasCredential(false);
    setSavedEmail(null);
  };

  return { supported, hasCredential, savedEmail, register, authenticate, clear };
};
