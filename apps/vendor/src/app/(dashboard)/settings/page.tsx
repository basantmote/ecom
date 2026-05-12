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
        <h1 className="font-serif text-2xl font-bold text-ink">Store Settings</h1>
        <p className="text-sm text-ink-3 mt-1">Manage your store profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Store Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Store Name</label>
              <input defaultValue="TechHub Nepal" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Store Description</label>
              <textarea rows={3} defaultValue="Nepal's premier electronics and gadgets store. We stock the latest smartphones, laptops, accessories and more."
                className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Category</label>
              <select className="input-field">
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home &amp; Living</option>
                <option>Beauty</option>
                <option>Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Business Phone</label>
              <input type="tel" defaultValue="+977-9841234567" className="input-field" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Payout Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">eSewa ID</label>
              <input type="tel" defaultValue="9841234567" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Khalti ID</label>
              <input type="tel" placeholder="Khalti registered number" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Bank Account (optional)</label>
              <input placeholder="Account number" className="input-field" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">Notifications</h2>
          {[
            { label: 'New order received', defaultChecked: true },
            { label: 'Order status updates', defaultChecked: true },
            { label: 'Payout processed', defaultChecked: true },
            { label: 'Weekly summary report', defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2 border-b border-line-soft last:border-0 cursor-pointer">
              <span className="text-sm text-ink">{item.label}</span>
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-crimson" />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary px-8">Save Changes</button>
          {saved && <span className="text-sm text-green-600 font-medium animate-fade-in">✓ Saved</span>}
        </div>
      </form>
    </div>
  )
}
