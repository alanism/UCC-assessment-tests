export type AiProvider = 'openai' | 'gemini' | 'anthropic';
export type ValidationStatus = 'idle' | 'valid' | 'invalid';

export interface ModelOption {
  id: string;
  label: string;
}

export interface ProviderValidation {
  status: ValidationStatus;
  validatedAt?: string;
  message?: string;
}

export interface ModelSnapshot {
  fetchedAt: string;
  models: ModelOption[];
}

export interface AiSettings {
  provider: AiProvider;
  selectedModel: string;
  customModel?: string;
  keys: Partial<Record<AiProvider, string>>;
  validation: Record<AiProvider, ProviderValidation>;
  availableModels: Record<AiProvider, ModelSnapshot>;
}

export interface ActiveModelConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

const DB_NAME = 'ucc-star360-ai-settings';
const STORE_NAME = 'settings';
const SETTINGS_KEY = 'primary';

const CURATED_MODELS: Record<AiProvider, ModelOption[]> = {
  openai: [
    { id: 'gpt-5.2', label: 'GPT-5.2' },
    { id: 'gpt-5-mini', label: 'GPT-5 mini' },
    { id: 'gpt-4.1', label: 'GPT-4.1' },
  ],
  gemini: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
  anthropic: [
    { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  ],
};

const EMPTY_VALIDATION = (): Record<AiProvider, ProviderValidation> => ({
  openai: { status: 'idle' },
  gemini: { status: 'idle' },
  anthropic: { status: 'idle' },
});

const makeSnapshot = (models: ModelOption[]): ModelSnapshot => ({
  fetchedAt: new Date(0).toISOString(),
  models,
});

const DEFAULT_SETTINGS: AiSettings = {
  provider: 'gemini',
  selectedModel: CURATED_MODELS.gemini[1].id,
  customModel: '',
  keys: {},
  validation: EMPTY_VALIDATION(),
  availableModels: {
    openai: makeSnapshot(CURATED_MODELS.openai),
    gemini: makeSnapshot(CURATED_MODELS.gemini),
    anthropic: makeSnapshot(CURATED_MODELS.anthropic),
  },
};

function mergeSettings(settings?: Partial<AiSettings> | null): AiSettings {
  return {
    provider: settings?.provider ?? DEFAULT_SETTINGS.provider,
    selectedModel: settings?.selectedModel ?? DEFAULT_SETTINGS.selectedModel,
    customModel: settings?.customModel ?? DEFAULT_SETTINGS.customModel,
    keys: { ...DEFAULT_SETTINGS.keys, ...(settings?.keys ?? {}) },
    validation: {
      ...EMPTY_VALIDATION(),
      ...(settings?.validation ?? {}),
    },
    availableModels: {
      openai: settings?.availableModels?.openai ?? DEFAULT_SETTINGS.availableModels.openai,
      gemini: settings?.availableModels?.gemini ?? DEFAULT_SETTINGS.availableModels.gemini,
      anthropic: settings?.availableModels?.anthropic ?? DEFAULT_SETTINGS.availableModels.anthropic,
    },
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error ?? new Error('Failed to open AI settings database.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function readStoredSettings(): Promise<AiSettings | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(SETTINGS_KEY);

    request.onerror = () => reject(request.error ?? new Error('Failed to read AI settings.'));
    request.onsuccess = () => resolve(request.result ? mergeSettings(request.result as AiSettings) : null);
  });
}

async function writeStoredSettings(settings: AiSettings): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Failed to save AI settings.'));
    store.put(settings, SETTINGS_KEY);
  });
}

function mergeCuratedModels(provider: AiProvider, fetchedModels: ModelOption[]): ModelOption[] {
  const unique = new Map<string, ModelOption>();

  CURATED_MODELS[provider].forEach((model) => unique.set(model.id, model));
  fetchedModels.forEach((model) => {
    if (model.id) {
      unique.set(model.id, unique.get(model.id) ?? model);
    }
  });

  return Array.from(unique.values());
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return payload?.error?.message || payload?.message || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function fetchOpenAiModels(apiKey: string): Promise<ModelOption[]> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const models = Array.isArray(payload?.data)
    ? payload.data
        .map((item: { id?: string }) => item.id)
        .filter((id: string | undefined): id is string => Boolean(id))
        .map((id: string) => ({ id, label: id }))
    : [];

  return mergeCuratedModels('openai', models);
}

async function fetchGeminiModels(apiKey: string): Promise<ModelOption[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const models = Array.isArray(payload?.models)
    ? payload.models
        .filter((item: { supportedGenerationMethods?: string[] }) =>
          Array.isArray(item.supportedGenerationMethods) && item.supportedGenerationMethods.includes('generateContent')
        )
        .map((item: { baseModelId?: string; name?: string; displayName?: string }) => {
          const id = item.baseModelId || item.name?.replace(/^models\//, '') || '';
          return {
            id,
            label: item.displayName || id,
          };
        })
        .filter((item: ModelOption) => Boolean(item.id))
    : [];

  return mergeCuratedModels('gemini', models);
}

async function fetchAnthropicModels(apiKey: string): Promise<ModelOption[]> {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const models = Array.isArray(payload?.data)
    ? payload.data
        .map((item: { id?: string; display_name?: string }) => ({
          id: item.id || '',
          label: item.display_name || item.id || '',
        }))
        .filter((item: ModelOption) => Boolean(item.id))
    : [];

  return mergeCuratedModels('anthropic', models);
}

function extractOpenAiText(payload: any): string {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const text = Array.isArray(payload?.output)
    ? payload.output
        .flatMap((item: any) => item?.content ?? [])
        .map((item: any) => item?.text ?? '')
        .filter(Boolean)
        .join('\n')
        .trim()
    : '';

  return text;
}

function extractGeminiText(payload: any): string {
  const text = Array.isArray(payload?.candidates)
    ? payload.candidates
        .flatMap((candidate: any) => candidate?.content?.parts ?? [])
        .map((part: any) => part?.text ?? '')
        .filter(Boolean)
        .join('\n')
        .trim()
    : '';

  return text;
}

function extractAnthropicText(payload: any): string {
  const text = Array.isArray(payload?.content)
    ? payload.content
        .filter((item: any) => item?.type === 'text')
        .map((item: any) => item?.text ?? '')
        .filter(Boolean)
        .join('\n')
        .trim()
    : '';

  return text;
}

export async function loadAiSettings(): Promise<AiSettings> {
  return mergeSettings(await readStoredSettings());
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await writeStoredSettings(mergeSettings(settings));
}

export async function validateProviderKey(
  provider: AiProvider,
  apiKey: string
): Promise<{ valid: boolean; models: ModelOption[]; message?: string }> {
  const trimmedKey = apiKey.trim();

  if (!trimmedKey) {
    return {
      valid: false,
      models: CURATED_MODELS[provider],
      message: 'Enter an API key before validating.',
    };
  }

  try {
    const models =
      provider === 'openai'
        ? await fetchOpenAiModels(trimmedKey)
        : provider === 'gemini'
          ? await fetchGeminiModels(trimmedKey)
          : await fetchAnthropicModels(trimmedKey);

    return {
      valid: true,
      models,
      message: `Validated ${provider} key and loaded ${models.length} model options.`,
    };
  } catch (error) {
    return {
      valid: false,
      models: CURATED_MODELS[provider],
      message: error instanceof Error ? error.message : 'Validation failed.',
    };
  }
}

export async function getActiveModelConfig(): Promise<ActiveModelConfig | null> {
  const settings = await loadAiSettings();
  const apiKey = settings.keys[settings.provider]?.trim();
  const model = settings.customModel?.trim() || settings.selectedModel?.trim();

  if (!apiKey || !model) {
    return null;
  }

  return {
    provider: settings.provider,
    apiKey,
    model,
  };
}

export async function generateTextWithConfig(
  config: ActiveModelConfig,
  options: GenerateTextOptions
): Promise<string> {
  if (config.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        input: options.prompt,
        instructions: options.systemInstruction,
        temperature: options.temperature,
        max_output_tokens: options.maxOutputTokens ?? 1200,
        text: { format: { type: 'text' } },
      }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = await response.json();
    const text = extractOpenAiText(payload);
    if (!text) {
      throw new Error('OpenAI returned an empty response.');
    }
    return text;
  }

  if (config.provider === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: options.systemInstruction
            ? { parts: [{ text: options.systemInstruction }] }
            : undefined,
          contents: [{ parts: [{ text: options.prompt }] }],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens ?? 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = await response.json();
    const text = extractGeminiText(payload);
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }
    return text;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: options.maxOutputTokens ?? 1200,
      temperature: options.temperature,
      system: options.systemInstruction,
      messages: [
        {
          role: 'user',
          content: options.prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const text = extractAnthropicText(payload);
  if (!text) {
    throw new Error('Claude returned an empty response.');
  }
  return text;
}
