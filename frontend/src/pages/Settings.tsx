import { useState, useEffect } from 'react'
import { Save, Radio, MessageSquare, RotateCw, Settings as SettingsIcon } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

interface FrpSettings {
  enabled: boolean
  port: number
  token?: string
}

interface TelegramSettings {
  enabled: boolean
  bot_token?: string
  admin_ids: string[]
  backup_enabled?: boolean
  backup_interval?: number
  backup_interval_unit?: string
}

interface TunnelSettings {
  auto_reapply_enabled?: boolean
  auto_reapply_interval?: number
  auto_reapply_interval_unit?: string
}

interface SettingsData {
  frp: FrpSettings
  telegram: TelegramSettings
  tunnel?: TunnelSettings
}

const Settings = () => {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<SettingsData>({
    frp: { enabled: false, port: 7000 },
    telegram: { enabled: false, admin_ids: [] },
    tunnel: { auto_reapply_enabled: false, auto_reapply_interval: 60, auto_reapply_interval_unit: 'minutes' }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage({ type: 'error', text: t.settings.failedToLoad })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/settings', settings)
      setMessage({ type: 'success', text: t.settings.settingsSaved })
      setTimeout(() => setMessage(null), 5000)
      await loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: t.settings.failedToSave })
    } finally {
      setSaving(false)
    }
  }

  const updateFrp = (updates: Partial<FrpSettings>) => {
    setSettings(prev => ({
      ...prev,
      frp: { ...prev.frp, ...updates }
    }))
  }

  const updateTelegram = (updates: Partial<TelegramSettings>) => {
    setSettings(prev => ({
      ...prev,
      telegram: { ...prev.telegram, ...updates }
    }))
  }

  const updateTunnel = (updates: Partial<TunnelSettings>) => {
    setSettings(prev => ({
      ...prev,
      tunnel: { ...prev.tunnel, ...updates } as TunnelSettings
    }))
  }

  const addAdminId = () => {
    const newId = prompt(t.settings.enterAdminId)
    if (newId && newId.trim()) {
      updateTelegram({
        admin_ids: [...settings.telegram.admin_ids, newId.trim()]
      })
    }
  }

  const removeAdminId = (index: number) => {
    updateTelegram({
      admin_ids: settings.telegram.admin_ids.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-purple-400 relative z-10"></div>
          </div>
          <p className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold glow-purple/50">{t.settings.loadingSettings}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-xl"></div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase gradient-text drop-shadow-sm mb-1">{t.settings.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="group relative overflow-hidden px-6 py-3 rounded-xl font-bold bg-white text-black hover:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            {saving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin relative z-10" />
            ) : (
              <Save size={20} className="relative z-10" />
            )}
            <span className="relative z-10 uppercase tracking-wider">{saving ? t.settings.saving : t.settings.saveSettings}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border relative overflow-hidden ${message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <p className="font-bold tracking-wide uppercase text-sm ml-2">{message.text}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* FRP Communication Settings */}
        <div className="glass-strong rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-50"></div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="text-orange-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{t.settings.frpCommunication}</h2>
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-wide mb-8">
              {t.settings.frpDescription}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <label htmlFor="frp-enabled" className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  {t.settings.enableFrp}
                </label>
                <button
                  type="button"
                  id="frp-enabled"
                  onClick={() => updateFrp({ enabled: !settings.frp.enabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${settings.frp.enabled ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/10'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.frp.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {settings.frp.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t.settings.frpPort}
                    </label>
                    <input
                      type="number"
                      value={settings.frp.port}
                      onChange={(e) => updateFrp({ port: parseInt(e.target.value) || 7000 })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-mono"
                      placeholder="7000"
                      min="1"
                      max="65535"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t.settings.frpPortDescription}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t.settings.frpTokenOptional}
                    </label>
                    <input
                      type="text"
                      value={settings.frp.token || ''}
                      onChange={(e) => updateFrp({ token: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-mono"
                      placeholder="Leave empty for no authentication"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t.settings.frpTokenDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Bot Settings */}
        <div className="glass-strong rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-500 opacity-50"></div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="text-blue-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{t.settings.telegramBot}</h2>
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-wide mb-8">
              {t.settings.telegramDescription}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <label htmlFor="telegram-enabled" className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  {t.settings.enableTelegram}
                </label>
                <button
                  type="button"
                  id="telegram-enabled"
                  onClick={() => updateTelegram({ enabled: !settings.telegram.enabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${settings.telegram.enabled ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.telegram.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {settings.telegram.enabled && (
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {t.settings.botToken}
                    </label>
                    <input
                      type="password"
                      value={settings.telegram.bot_token || ''}
                      onChange={(e) => updateTelegram({ bot_token: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                      placeholder="Enter bot token from @BotFather"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t.settings.botTokenDescription}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {t.settings.adminUserIds}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {settings.telegram.admin_ids.map((id, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => {
                              const newIds = [...settings.telegram.admin_ids]
                              newIds[index] = e.target.value
                              updateTelegram({ admin_ids: newIds })
                            }}
                            className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none font-mono text-sm"
                          />
                          <button
                            onClick={() => removeAdminId(index)}
                            className="px-3 py-2 bg-rose-500/20 text-rose-400 font-bold uppercase text-xs rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            {t.settings.remove}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addAdminId}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/10 transition-colors"
                    >
                      + {t.settings.addAdminId}
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      {t.settings.adminUserIdsDescription}
                    </p>
                  </div>

                  <div className="p-5 bg-black/20 border border-white/5 rounded-2xl mt-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
                      <Save size={16} className="text-blue-400" />
                      {t.settings.automaticBackup}
                    </h3>

                    <div className="flex items-center justify-between mb-6">
                      <label htmlFor="backup-enabled" className="text-sm font-bold uppercase tracking-wide text-gray-400">
                        {t.settings.enableBackup}
                      </label>
                      <button
                        type="button"
                        id="backup-enabled"
                        onClick={(e) => updateTelegram({ backup_enabled: !(settings.telegram.backup_enabled || false) })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${settings.telegram.backup_enabled ? 'bg-blue-500' : 'bg-white/10'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.telegram.backup_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {settings.telegram.backup_enabled && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                              {t.settings.backupInterval}
                            </label>
                            <input
                              type="number"
                              value={settings.telegram.backup_interval || 60}
                              onChange={(e) => updateTelegram({ backup_interval: parseInt(e.target.value) || 60 })}
                              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
                              placeholder="60"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                              {t.settings.intervalUnit}
                            </label>
                            <select
                              value={settings.telegram.backup_interval_unit || 'minutes'}
                              onChange={(e) => updateTelegram({ backup_interval_unit: e.target.value })}
                              className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-bold tracking-wider uppercase text-sm appearance-none"
                            >
                              <option value="minutes" className="bg-gray-900">{t.settings.minutes}</option>
                              <option value="hours" className="bg-gray-900">{t.settings.hours}</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t.settings.backupDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tunnel Settings */}
        <div className="glass-strong rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500 opacity-50"></div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <RotateCw className="text-emerald-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{t.settings.tunnelAutoReapply || 'Tunnel Auto Reapply'}</h2>
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-wide mb-8">
              {t.settings.tunnelAutoReapplyDescription || 'Automatically reapply all tunnels at specified intervals'}
            </p>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 gap-4">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  {t.settings.enableTunnelAutoReapply || 'Enable Automatic Tunnel Reapply'}
                </label>
                <button
                  type="button"
                  onClick={() => updateTunnel({ auto_reapply_enabled: !(settings.tunnel?.auto_reapply_enabled || false) })}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${settings.tunnel?.auto_reapply_enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.tunnel?.auto_reapply_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {settings.tunnel?.auto_reapply_enabled && (
                <div className="pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {t.settings.tunnelReapplyInterval || 'Reapply Interval'}
                      </label>
                      <input
                        type="number"
                        value={settings.tunnel?.auto_reapply_interval || 60}
                        onChange={(e) => updateTunnel({ auto_reapply_interval: parseInt(e.target.value) || 60 })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 font-mono"
                        placeholder="60"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {t.settings.intervalUnit || 'Interval Unit'}
                      </label>
                      <select
                        value={settings.tunnel?.auto_reapply_interval_unit || 'minutes'}
                        onChange={(e) => updateTunnel({ auto_reapply_interval_unit: e.target.value })}
                        className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 font-bold tracking-wider uppercase text-sm appearance-none"
                      >
                        <option value="minutes" className="bg-gray-900">{t.settings.minutes}</option>
                        <option value="hours" className="bg-gray-900">{t.settings.hours}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
