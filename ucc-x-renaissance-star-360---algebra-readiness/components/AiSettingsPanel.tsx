import React, { useEffect, useMemo, useState } from 'react';
import {
  AiProvider,
  AiSettings,
  loadAiSettings,
  saveAiSettings,
  validateProviderKey,
} from '../aiSettings';

interface AiSettingsPanelProps {
  purpose: string;
}

const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: 'OpenAI',
  gemini: 'Gemini',
  anthropic: 'Claude',
};

export const AiSettingsPanel: React.FC<AiSettingsPanelProps> = ({ purpose }) => {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini');
  const [draftKey, setDraftKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [validatedDraftKey, setValidatedDraftKey] = useState('');

  useEffect(() => {
    loadAiSettings().then((loaded) => {
      setSettings(loaded);
      hydrateDraft(loaded, loaded.provider);
    });
  }, []);

  const activeValidation = settings?.validation[activeProvider];
  const availableModels = settings?.availableModels[activeProvider]?.models ?? [];
  const savedKey = settings?.keys[activeProvider] ?? '';
  const resolvedModel = customModel.trim() || selectedModel;
  const activeSummary = useMemo(() => {
    if (!settings) {
      return 'Loading local AI settings...';
    }

    const model = settings.customModel?.trim() || settings.selectedModel;
    if (!settings.keys[settings.provider] || !model) {
      return 'No validated key saved on this app origin.';
    }

    return `${PROVIDER_LABELS[settings.provider]} · ${model}`;
  }, [settings]);

  const canSave =
    Boolean(settings) &&
    Boolean(draftKey.trim()) &&
    Boolean(resolvedModel) &&
    activeValidation?.status === 'valid' &&
    validatedDraftKey === draftKey.trim();

  function hydrateDraft(nextSettings: AiSettings, provider: AiProvider) {
    setActiveProvider(provider);
    setDraftKey(nextSettings.keys[provider] ?? '');
    setSelectedModel(
      provider === nextSettings.provider
        ? nextSettings.selectedModel || nextSettings.availableModels[provider].models[0]?.id || ''
        : nextSettings.availableModels[provider].models[0]?.id || ''
    );
    setCustomModel(provider === nextSettings.provider ? nextSettings.customModel ?? '' : '');
    setValidatedDraftKey(nextSettings.validation[provider].status === 'valid' ? nextSettings.keys[provider]?.trim() ?? '' : '');
  }

  async function handleValidate() {
    if (!settings) {
      return;
    }

    setIsValidating(true);
    setStatusMessage('');

    const result = await validateProviderKey(activeProvider, draftKey);
    const nextSettings: AiSettings = {
      ...settings,
      availableModels: {
        ...settings.availableModels,
        [activeProvider]: {
          fetchedAt: new Date().toISOString(),
          models: result.models,
        },
      },
      validation: {
        ...settings.validation,
        [activeProvider]: {
          status: result.valid ? 'valid' : 'invalid',
          validatedAt: new Date().toISOString(),
          message: result.message,
        },
      },
    };

    setSettings(nextSettings);
    setSelectedModel((currentModel) => {
      if (currentModel && result.models.some((model) => model.id === currentModel)) {
        return currentModel;
      }
      return result.models[0]?.id ?? '';
    });
    setValidatedDraftKey(result.valid ? draftKey.trim() : '');
    setStatusMessage(result.message ?? '');
    setIsValidating(false);
  }

  async function handleSave() {
    if (!settings || !canSave) {
      return;
    }

    const nextSettings: AiSettings = {
      ...settings,
      provider: activeProvider,
      selectedModel,
      customModel: customModel.trim(),
      keys: {
        ...settings.keys,
        [activeProvider]: draftKey.trim(),
      },
    };

    await saveAiSettings(nextSettings);
    setSettings(nextSettings);
    setStatusMessage(`Saved ${PROVIDER_LABELS[activeProvider]} settings locally for this app origin.`);
  }

  async function handleClearSavedKey() {
    if (!settings) {
      return;
    }

    const nextSettings: AiSettings = {
      ...settings,
      keys: {
        ...settings.keys,
        [activeProvider]: '',
      },
      validation: {
        ...settings.validation,
        [activeProvider]: {
          status: 'idle',
        },
      },
      customModel: activeProvider === settings.provider ? '' : settings.customModel,
    };

    await saveAiSettings(nextSettings);
    setSettings(nextSettings);
    setDraftKey('');
    setValidatedDraftKey('');
    setStatusMessage(`Cleared saved ${PROVIDER_LABELS[activeProvider]} key from this app origin.`);
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="ucc-card p-5 border border-gray-200/80 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4EABBC]">Local AI Settings</p>
          <p className="text-sm font-bold text-[#111827]">{activeSummary}</p>
          <p className="text-xs text-gray-500 mt-1">{purpose}</p>
          <p className="text-[11px] text-gray-400 mt-2">Stored in IndexedDB on this app URL only. Separate deployments do not share browser-local keys.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="px-4 py-2 rounded-xl border-2 border-[#4EABBC] text-[#4EABBC] font-black uppercase tracking-widest text-[10px] hover:bg-[#4EABBC] hover:text-white transition-all"
        >
          {isOpen ? 'Hide Settings' : 'Manage Settings'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PROVIDER_LABELS) as AiProvider[]).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => hydrateDraft(settings, provider)}
                className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                  activeProvider === provider
                    ? 'bg-[#111827] text-white border-[#111827]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#4EABBC] hover:text-[#4EABBC]'
                }`}
              >
                {PROVIDER_LABELS[provider]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">API Key</label>
              <input
                type={revealKey ? 'text' : 'password'}
                value={draftKey}
                onChange={(event) => {
                  setDraftKey(event.target.value);
                  if (event.target.value.trim() !== savedKey.trim()) {
                    setValidatedDraftKey('');
                  }
                }}
                placeholder={`Paste your ${PROVIDER_LABELS[activeProvider]} API key`}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4EABBC]"
              />
              <button type="button" onClick={() => setRevealKey((value) => !value)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#4EABBC]">
                {revealKey ? 'Mask Key' : 'Reveal Key'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Curated Model</label>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4EABBC] bg-white"
              >
                <option value="">Select a model</option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={customModel}
                onChange={(event) => setCustomModel(event.target.value)}
                placeholder="Optional custom model ID override"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4EABBC]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !draftKey.trim()}
              className="px-5 py-3 rounded-xl bg-[#4EABBC] text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-3 rounded-xl bg-[#111827] text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleClearSavedKey}
              disabled={!savedKey}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-500 font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              Clear Saved Key
            </button>
          </div>

          <div className="text-xs">
            <p className={`font-bold ${activeValidation?.status === 'invalid' ? 'text-[#E9604F]' : 'text-gray-600'}`}>
              {statusMessage || activeValidation?.message || 'Validate a provider key before saving changes.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
