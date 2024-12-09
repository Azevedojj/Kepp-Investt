import React, { useState } from 'react';
import { Settings, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { UserSettings } from '../../types';

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
];

interface PreferencesCardProps {
  settings: UserSettings;
  onSettingChange: (setting: keyof UserSettings) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  settings,
  onSettingChange
}) => {
  const { t, i18n } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    i18n.changeLanguage(selectedLanguage);
    toast.success(t('settings.preferences.localization.language.changed'));
    setShowLanguageModal(false);
  };

  return (
    <>
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {t('settings.preferences.title')}
        </h2>

        <div className="space-y-4">
          {/* Idioma */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Globe className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {LANGUAGES.find(lang => lang.code === i18n.language)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {t('settings.preferences.localization.language.current')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              {t('common.change')}
            </button>
          </div>

          {/* Outras preferências... */}
        </div>
      </div>

      {/* Modal de Seleção de Idioma */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('settings.preferences.localization.language.select')}
              </h3>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLanguageSubmit}>
              <div className="space-y-4 mb-6">
                {LANGUAGES.map((language) => (
                  <label
                    key={language.code}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      selectedLanguage === language.code 
                        ? 'bg-orange-50 border-2 border-orange-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Globe className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {language.name}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="language"
                      value={language.code}
                      checked={selectedLanguage === language.code}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full ${
                      selectedLanguage === language.code 
                        ? 'border-orange-600 bg-orange-600' 
                        : 'border-gray-300'
                    }`}>
                      {selectedLanguage === language.code && (
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 