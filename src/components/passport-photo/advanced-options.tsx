'use client'

import { Input } from '@/components/ui/input'
import { usePassportStore } from '@/store/passport-store'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// Preset background colors commonly used for passport photos
const PRESET_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Light Blue', value: '#d6eaf8' },
  { name: 'Sky Blue', value: '#a8d8ff' },
  { name: 'Cream', value: '#fffef5' },
  { name: 'Light Red', value: '#ffebee' },
  { name: 'Blue', value: '#4a90d9' },
  { name: 'Navy', value: '#1a3a5c' },
]

export function AdvancedOptions() {
  const { advancedSettings, updateAdvancedSettings } = usePassportStore()

  const handleColorSelect = (color: string) => {
    updateAdvancedSettings({ backgroundColor: color })
  }

  return (
    <div className="bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-5 mt-3">
      {/* Dimensions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <label className="block text-xs font-semibold text-[#4a4540] uppercase tracking-wide mb-1.5">
            Width (px)
          </label>
          <Input
            type="number"
            value={advancedSettings.width}
            onChange={(e) => updateAdvancedSettings({ width: parseInt(e.target.value) || 390 })}
            min={100}
            max={1000}
            className="w-full py-2 px-3 border-2 border-[#d6cfc2] rounded-lg bg-white text-sm text-[#1c1a17] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.12)]"
          />
        </div>
        <div className="field-group">
          <label className="block text-xs font-semibold text-[#4a4540] uppercase tracking-wide mb-1.5">
            Height (px)
          </label>
          <Input
            type="number"
            value={advancedSettings.height}
            onChange={(e) => updateAdvancedSettings({ height: parseInt(e.target.value) || 480 })}
            min={100}
            max={1000}
            className="w-full py-2 px-3 border-2 border-[#d6cfc2] rounded-lg bg-white text-sm text-[#1c1a17] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.12)]"
          />
        </div>
        <div className="field-group">
          <label className="block text-xs font-semibold text-[#4a4540] uppercase tracking-wide mb-1.5">
            Spacing (px)
          </label>
          <Input
            type="number"
            value={advancedSettings.spacing}
            onChange={(e) => updateAdvancedSettings({ spacing: parseInt(e.target.value) || 30 })}
            min={0}
            max={100}
            className="w-full py-2 px-3 border-2 border-[#d6cfc2] rounded-lg bg-white text-sm text-[#1c1a17] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.12)]"
          />
        </div>
        <div className="field-group">
          <label className="block text-xs font-semibold text-[#4a4540] uppercase tracking-wide mb-1.5">
            Border (px)
          </label>
          <Input
            type="number"
            value={advancedSettings.border}
            onChange={(e) => updateAdvancedSettings({ border: parseInt(e.target.value) || 2 })}
            min={0}
            max={20}
            className="w-full py-2 px-3 border-2 border-[#d6cfc2] rounded-lg bg-white text-sm text-[#1c1a17] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.12)]"
          />
        </div>
      </div>

      {/* Background Color Section */}
      <div className="mt-5 pt-4 border-t border-[#e8e2d6]">
        <label className="block text-xs font-semibold text-[#4a4540] uppercase tracking-wide mb-2.5">
          Background Color
          <span className="ml-1.5 text-[#8a8178] font-normal normal-case text-[0.65rem]">
            (applied after background removal)
          </span>
        </label>

        {/* Preset Colors */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorSelect(color.value)}
              title={color.name}
              className={cn(
                "relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                advancedSettings.backgroundColor === color.value
                  ? "border-[#c8773a] ring-2 ring-[rgba(200,119,58,0.3)]"
                  : "border-[#d6cfc2] hover:border-[#c8773a]"
              )}
              style={{ backgroundColor: color.value }}
            >
              {advancedSettings.backgroundColor === color.value && (
                <Check 
                  className={cn(
                    "absolute inset-0 m-auto w-4 h-4",
                    color.value === '#ffffff' || color.value === '#f0f0f0' || color.value === '#fffef5' || color.value === '#ffebee' || color.value === '#d6eaf8' || color.value === '#a8d8ff'
                      ? "text-[#1c1a17]"
                      : "text-white"
                  )} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={advancedSettings.backgroundColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-10 h-10 rounded-lg border-2 border-[#d6cfc2] cursor-pointer bg-transparent p-0.5"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={advancedSettings.backgroundColor.toUpperCase()}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    if (value.length === 7) {
                      handleColorSelect(value)
                    }
                  }
                }}
                placeholder="#FFFFFF"
                className="w-24 py-2 px-3 border-2 border-[#d6cfc2] rounded-lg bg-white text-sm text-[#1c1a17] font-mono focus:outline-none focus:border-[#c8773a]"
              />
              <span className="text-xs text-[#8a8178]">Custom color</span>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-3 flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-[#d6cfc2] shadow-inner"
            style={{ backgroundColor: advancedSettings.backgroundColor }}
          />
          <div className="text-xs text-[#8a8178]">
            <div className="font-medium text-[#4a4540] mb-0.5">Preview</div>
            <div>Selected: {advancedSettings.backgroundColor.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
