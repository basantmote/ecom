'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink-3 mt-1">Manage platform configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Platform */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Platform</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Platform Name</label>
              <input defaultValue="हाम्रोBazaar" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Support Email</label>
              <input type="email" defaultValue="support@hamrobazaar.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Default Commission (%)</label>
              <input type="number" defaultValue="8" min="0" max="50" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Min. Free Delivery (Rs.)</label>
              <input type="number" defaultValue="999" className="input-field" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Notifications</h2>
          {[
            { label: 'New vendor registration', defaultChecked: true },
            { label: 'New order placed', defaultChecked: true },
            { label: 'Payment dispute raised', defaultChecked: true },
            { label: 'Weekly revenue report', defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2 border-b border-line-soft last:border-0 cursor-pointer">
              <span className="text-sm text-ink">{item.label}</span>
              <input type="checkbox" defaultChecked={item.defaultChecked}
                className="w-4 h-4 accent-crimson rounded" />
            </label>
          ))}
        </div>

        {/* Security */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Security</h2>
          <div>
            <label className="block text-xs font-medium text-ink-3 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">New Password</label>
              <input type="password" placeholder="••••••••" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="input-field" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary px-8">Save Changes</button>
          {saved && <span className="text-sm text-green-600 font-medium animate-fade-in">✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  )
}
