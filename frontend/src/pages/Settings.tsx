import { useState, useEffect } from 'react'
import { Save, Radio, MessageSquare, RotateCw, Settings as SettingsIcon, Loader2 } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <SettingsIcon className="text-cyan-400 w-12 h-12 animate-spin drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
        <p className="text-white/60 text-sm font-bold tracking-widest uppercase">{t.settings.loadingSettings || "Initializing Subsystems..."}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{t.settings.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-50 font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin text-cyan-400" /> : <Save size={18} className="text-cyan-400" />}
            <span>{saving ? t.settings.saving : t.settings.saveSettings}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-bold tracking-wide flex items-center gap-3 ${message.type === 'success'
          ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]'
          : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.1)]'
          }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* FRP Communication Settings */}
        <div className="glass-panel overflow-hidden rounded-2xl relative border border-white/10">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-transparent opacity-50"></div>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                <Radio size={24} />
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">{t.settings.frpCommunication}</h2>
            </div>
            <p className="text-sm text-white/50 mb-8 font-medium max-w-2xl leading-relaxed">
              {t.settings.frpDescription}
            </p>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <label htmlFor="frp-enabled" className="text-sm font-bold uppercase tracking-widest text-white/80 cursor-pointer">
                  {t.settings.enableFrp}
                </label>
                <div
                  id="frp-enabled"
                  onClick={() => updateFrp({ enabled: !settings.frp.enabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer shadow-inner border border-white/10 ${settings.frp.enabled ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-400' : 'bg-white/10'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.frp.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.frp.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5 animation-fade-in">
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                      {t.settings.frpPort}
                    </label>
                    <input
                      type="number"
                      value={settings.frp.port}
                      onChange={(e) => updateFrp({ port: parseInt(e.target.value) || 7000 })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white font-mono text-sm transition-all shadow-inner"
                      placeholder="7000"
                      min="1"
                      max="65535"
                    />
                    <p className="text-xs text-white/40 mt-1.5 font-medium">
                      {t.settings.frpPortDescription}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                      {t.settings.frpTokenOptional}
                    </label>
                    <input
                      type="text"
                      value={settings.frp.token || ''}
                      onChange={(e) => updateFrp({ token: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white font-mono text-sm transition-all shadow-inner placeholder-white/20"
                      placeholder="Leave empty for no authentication"
                    />
                    <p className="text-xs text-white/40 mt-1.5 font-medium">
                      {t.settings.frpTokenDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Bot Settings */}
        <div className="glass-panel overflow-hidden rounded-2xl relative border border-white/10">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-transparent opacity-50"></div>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">{t.settings.telegramBot}</h2>
            </div>
            <p className="text-sm text-white/50 mb-8 font-medium max-w-2xl leading-relaxed">
              {t.settings.telegramDescription}
            </p>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <label htmlFor="telegram-enabled" className="text-sm font-bold uppercase tracking-widest text-white/80 cursor-pointer">
                  {t.settings.enableTelegram}
                </label>
                <div
                  id="telegram-enabled"
                  onClick={() => updateTelegram({ enabled: !settings.telegram.enabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer shadow-inner border border-white/10 ${settings.telegram.enabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] border-cyan-400' : 'bg-white/10'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.telegram.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.telegram.enabled && (
                <div className="space-y-8 pt-6 border-t border-white/5 animation-fade-in">
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                      {t.settings.botToken}
                    </label>
                    <input
                      type="password"
                      value={settings.telegram.bot_token || ''}
                      onChange={(e) => updateTelegram({ bot_token: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white font-mono text-sm transition-all shadow-inner placeholder-white/20"
                      placeholder="Enter bot token from @BotFather"
                    />
                    <p className="text-xs text-white/40 mt-1.5 font-medium">
                      {t.settings.botTokenDescription}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                      {t.settings.adminUserIds}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {settings.telegram.admin_ids.map((id, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-white/10">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => {
                              const newIds = [...settings.telegram.admin_ids]
                              newIds[index] = e.target.value
                              updateTelegram({ admin_ids: newIds })
                            }}
                            className="flex-1 px-2 py-1.5 bg-transparent border-b border-transparent focus:border-cyan-500/50 focus:outline-none font-mono text-sm text-white"
                          />
                          <button
                            onClick={() => removeAdminId(index)}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addAdminId}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors mt-2"
                    >
                      + {t.settings.addAdminId}
                    </button>
                    <p className="text-xs text-white/40 mt-2 font-medium">
                      {t.settings.adminUserIdsDescription}
                    </p>
                  </div>

                  <div className="p-6 bg-black/40 border border-white/5 rounded-2xl mt-8 shadow-inner relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
                    <h3 className="text-base font-black mb-6 flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/10 rounded-lg text-white/70">
                        <Save size={18} />
                      </div>
                      {t.settings.automaticBackup}
                    </h3>

                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                      <label htmlFor="backup-enabled" className="text-sm font-bold uppercase tracking-widest text-white/80 cursor-pointer">
                        {t.settings.enableBackup}
                      </label>
                      <div
                        id="backup-enabled"
                        onClick={() => updateTelegram({ backup_enabled: !(settings.telegram.backup_enabled || false) })}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer shadow-inner border border-white/10 ${settings.telegram.backup_enabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] border-cyan-400' : 'bg-white/10'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.telegram.backup_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </div>
                    </div>

                    {settings.telegram.backup_enabled && (
                      <div className="space-y-5 animation-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                              {t.settings.backupInterval}
                            </label>
                            <input
                              type="number"
                              value={settings.telegram.backup_interval || 60}
                              onChange={(e) => updateTelegram({ backup_interval: parseInt(e.target.value) || 60 })}
                              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-sm text-white transition-all"
                              placeholder="60"
                              min="1"
                            />
                          </div>
                          <div className="space-y-2.5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                              {t.settings.intervalUnit}
                            </label>
                            <select
                              value={settings.telegram.backup_interval_unit || 'minutes'}
                              onChange={(e) => updateTelegram({ backup_interval_unit: e.target.value })}
                              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm text-white transition-all appearance-none cursor-pointer"
                            >
                              <option value="minutes" className="bg-gray-900">{t.settings.minutes}</option>
                              <option value="hours" className="bg-gray-900">{t.settings.hours}</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-white/40 font-medium">
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
        <div className="glass-panel overflow-hidden rounded-2xl relative border border-white/10">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-transparent opacity-50"></div>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
                <RotateCw size={24} />
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">{(t.settings as any).tunnelAutoReapply || 'Tunnel Automation'}</h2>
            </div>
            <p className="text-sm text-white/50 mb-8 font-medium max-w-2xl leading-relaxed">
              {(t.settings as any).tunnelAutoReapplyDescription || 'Autonomously re-initialize established link sessions sequentially.'}
            </p>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <label className="text-sm font-bold uppercase tracking-widest text-white/80 cursor-pointer">
                  {(t.settings as any).enableTunnelAutoReapply || 'Enable Auto-Reapply Protocol'}
                </label>
                <div
                  onClick={() => updateTunnel({ auto_reapply_enabled: !(settings.tunnel?.auto_reapply_enabled || false) })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer shadow-inner border border-white/10 ${settings.tunnel?.auto_reapply_enabled ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-purple-400' : 'bg-white/10'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.tunnel?.auto_reapply_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.tunnel?.auto_reapply_enabled && (
                <div className="pt-6 border-t border-white/5 animation-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                        {(t.settings as any).tunnelReapplyInterval || 'Reapply Interval'}
                      </label>
                      <input
                        type="number"
                        value={settings.tunnel?.auto_reapply_interval || 60}
                        onChange={(e) => updateTunnel({ auto_reapply_interval: parseInt(e.target.value) || 60 })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono text-sm text-white transition-all shadow-inner"
                        placeholder="60"
                        min="1"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
                        {t.settings.intervalUnit || 'Interval Unit'}
                      </label>
                      <select
                        value={settings.tunnel?.auto_reapply_interval_unit || 'minutes'}
                        onChange={(e) => updateTunnel({ auto_reapply_interval_unit: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm text-white transition-all appearance-none cursor-pointer shadow-inner"
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
