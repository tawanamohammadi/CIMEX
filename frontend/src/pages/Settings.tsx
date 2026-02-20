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
        <SettingsIcon className="text-primary w-8 h-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">{t.settings.loadingSettings || "Loading Settings..."}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t.settings.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? t.settings.saving : t.settings.saveSettings}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md border text-sm font-medium ${message.type === 'success'
          ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* FRP Communication Settings */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">{t.settings.frpCommunication}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t.settings.frpDescription}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <label htmlFor="frp-enabled" className="text-sm font-semibold">
                  {t.settings.enableFrp}
                </label>
                <div
                  id="frp-enabled"
                  onClick={() => updateFrp({ enabled: !settings.frp.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.frp.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.frp.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.frp.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.settings.frpPort}
                    </label>
                    <input
                      type="number"
                      value={settings.frp.port}
                      onChange={(e) => updateFrp({ port: parseInt(e.target.value) || 7000 })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono"
                      placeholder="7000"
                      min="1"
                      max="65535"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {t.settings.frpPortDescription}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.settings.frpTokenOptional}
                    </label>
                    <input
                      type="text"
                      value={settings.frp.token || ''}
                      onChange={(e) => updateFrp({ token: e.target.value || undefined })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono"
                      placeholder="Leave empty for no authentication"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {t.settings.frpTokenDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Bot Settings */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">{t.settings.telegramBot}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t.settings.telegramDescription}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <label htmlFor="telegram-enabled" className="text-sm font-semibold">
                  {t.settings.enableTelegram}
                </label>
                <div
                  id="telegram-enabled"
                  onClick={() => updateTelegram({ enabled: !settings.telegram.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.telegram.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.telegram.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.telegram.enabled && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t.settings.botToken}
                    </label>
                    <input
                      type="password"
                      value={settings.telegram.bot_token || ''}
                      onChange={(e) => updateTelegram({ bot_token: e.target.value || undefined })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono"
                      placeholder="Enter bot token from @BotFather"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {t.settings.botTokenDescription}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      {t.settings.adminUserIds}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {settings.telegram.admin_ids.map((id, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 border border-border rounded-lg">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => {
                              const newIds = [...settings.telegram.admin_ids]
                              newIds[index] = e.target.value
                              updateTelegram({ admin_ids: newIds })
                            }}
                            className="flex-1 px-2 py-1 bg-transparent focus:outline-none font-mono text-sm"
                          />
                          <button
                            onClick={() => removeAdminId(index)}
                            className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded hover:bg-destructive/20 transition-colors"
                          >
                            {t.settings.remove}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addAdminId}
                      className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      + {t.settings.addAdminId}
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t.settings.adminUserIdsDescription}
                    </p>
                  </div>

                  <div className="p-5 bg-muted/20 border border-border rounded-lg mt-4">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Save size={16} className="text-muted-foreground" />
                      {t.settings.automaticBackup}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <label htmlFor="backup-enabled" className="text-sm font-medium">
                        {t.settings.enableBackup}
                      </label>
                      <div
                        id="backup-enabled"
                        onClick={() => updateTelegram({ backup_enabled: !(settings.telegram.backup_enabled || false) })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.telegram.backup_enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.telegram.backup_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </div>
                    </div>

                    {settings.telegram.backup_enabled && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              {t.settings.backupInterval}
                            </label>
                            <input
                              type="number"
                              value={settings.telegram.backup_interval || 60}
                              onChange={(e) => updateTelegram({ backup_interval: parseInt(e.target.value) || 60 })}
                              className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                              placeholder="60"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              {t.settings.intervalUnit}
                            </label>
                            <select
                              value={settings.telegram.backup_interval_unit || 'minutes'}
                              onChange={(e) => updateTelegram({ backup_interval_unit: e.target.value })}
                              className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                            >
                              <option value="minutes">{t.settings.minutes}</option>
                              <option value="hours">{t.settings.hours}</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
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
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <RotateCw className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">{(t.settings as any).tunnelAutoReapply || 'Tunnel Auto Reapply'}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {(t.settings as any).tunnelAutoReapplyDescription || 'Automatically reapply all tunnels at specified intervals'}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <label className="text-sm font-semibold">
                  {(t.settings as any).enableTunnelAutoReapply || 'Enable Automatic Tunnel Reapply'}
                </label>
                <div
                  onClick={() => updateTunnel({ auto_reapply_enabled: !(settings.tunnel?.auto_reapply_enabled || false) })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.tunnel?.auto_reapply_enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.tunnel?.auto_reapply_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>

              {settings.tunnel?.auto_reapply_enabled && (
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {(t.settings as any).tunnelReapplyInterval || 'Reapply Interval'}
                      </label>
                      <input
                        type="number"
                        value={settings.tunnel?.auto_reapply_interval || 60}
                        onChange={(e) => updateTunnel({ auto_reapply_interval: parseInt(e.target.value) || 60 })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                        placeholder="60"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t.settings.intervalUnit || 'Interval Unit'}
                      </label>
                      <select
                        value={settings.tunnel?.auto_reapply_interval_unit || 'minutes'}
                        onChange={(e) => updateTunnel({ auto_reapply_interval_unit: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      >
                        <option value="minutes">{t.settings.minutes}</option>
                        <option value="hours">{t.settings.hours}</option>
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
