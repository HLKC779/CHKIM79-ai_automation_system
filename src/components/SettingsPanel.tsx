import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Settings, Sliders, FileAudio, Globe } from 'lucide-react';
import { cn } from '../utils/cn';

interface SettingsPanelProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  register,
  watch,
  setValue,
  errors,
}) => {
  const speed = watch('speed');
  const pitch = watch('pitch');
  const volume = watch('volume');

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-6">
      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
        <Settings className="w-5 h-5" />
        <h3 className="font-semibold">Settings</h3>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Speed
          </label>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {speed}x
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            {...register('speed')}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* Pitch Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Pitch
          </label>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {pitch > 0 ? `+${pitch}` : pitch}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            {...register('pitch')}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>-20</span>
            <span>0</span>
            <span>+20</span>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Volume
          </label>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            {...register('volume')}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Output Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['mp3', 'wav', 'ogg', 'm4a'].map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => setValue('format', format)}
              className={cn(
                "p-2 text-sm rounded-lg border transition-colors",
                watch('format') === format
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              )}
            >
              <div className="flex items-center space-x-2">
                <FileAudio className="w-4 h-4" />
                <span className="font-medium">{format.toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Language
        </label>
        <select
          {...register('language')}
          className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4" />
          <span className="text-sm font-medium">Advanced</span>
        </div>
        
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>Auto-save history</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>High quality mode</span>
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium">Tips:</p>
            <ul className="mt-1 space-y-1">
              <li>• Speed: 0.5x to 2.0x</li>
              <li>• Pitch: -20 to +20</li>
              <li>• Volume: 0% to 100%</li>
              <li>• Max text: 5000 characters</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider:focus {
          outline: none;
        }
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SettingsPanel;