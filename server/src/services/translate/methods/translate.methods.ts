import type { TranslateBody } from '../schemas/translate.schema.js';

const DEEPL_FREE_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_PRO_URL = 'https://api.deepl.com/v2/translate';

function deeplAuthKey() {
  return process.env.DEEPL_AUTH_KEY?.trim() || process.env.DEEPL_API_KEY?.trim() || '';
}

function deeplEndpoint(authKey: string) {
  // Free keys end with :fx
  if (authKey.endsWith(':fx') || process.env.DEEPL_API_URL?.includes('api-free')) {
    return process.env.DEEPL_API_URL?.trim() || DEEPL_FREE_URL;
  }
  return process.env.DEEPL_API_URL?.trim() || DEEPL_PRO_URL;
}

export async function translateText(body: TranslateBody) {
  const authKey = deeplAuthKey();
  if (!authKey) {
    throw new Error('DeepL is not configured — set DEEPL_AUTH_KEY');
  }

  const sourceLang = body.sourceLang ?? 'EN';
  const targetLang = body.targetLang ?? 'FR';
  if (sourceLang === targetLang) {
    return {
      text: body.text,
      detectedSourceLanguage: sourceLang,
      sourceLang,
      targetLang,
    };
  }

  const res = await fetch(deeplEndpoint(authKey), {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [body.text],
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    if (res.status === 403 || res.status === 401) {
      throw new Error('DeepL authentication failed — check DEEPL_AUTH_KEY');
    }
    if (res.status === 456) {
      throw new Error('DeepL quota exceeded');
    }
    throw new Error(
      detail
        ? `DeepL error (${res.status}): ${detail.slice(0, 200)}`
        : `DeepL request failed (${res.status})`
    );
  }

  const data = (await res.json()) as {
    translations?: { text?: string; detected_source_language?: string }[];
  };
  const translation = data.translations?.[0];
  if (!translation?.text) {
    throw new Error('DeepL returned an empty translation');
  }

  return {
    text: translation.text,
    detectedSourceLanguage: translation.detected_source_language ?? sourceLang,
    sourceLang,
    targetLang,
  };
}
