import { useCallback } from 'react'
import { useSettings } from '../context/SettingsContext'
import translations from '../data/translations.json'

// Read a dotted translation key and fill any {placeholders} in its string.
export function useT() {
  const { language } = useSettings()
  const t = useCallback((key, values = {}) => {
    const read = dictionary => key.split('.').reduce((value, part) => value?.[part], dictionary)
    const text = read(translations[language]) ?? read(translations.en) ?? key
    if (typeof text !== 'string') return key
    return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match)
  }, [language])
  return { t, language }
}

export default useT
