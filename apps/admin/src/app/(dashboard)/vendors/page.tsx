'use client'

import { useState } from 'react'

// ─── Demo Data ────────────────────────────────────────────────────────────────

type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Vendor {
  id: string
  name: string
  category: string
  email: string
  status: VendorStatus
  products: number
  revenue: number // paisa
  joinedDate: string
}

const initialVendors: Vendor[] = [
  { id: 'V001', name: 'Himalayan Crafts', category: 'Handicrafts', email: 'hello@himalayancraft.np', status: 'PENDING', products: 0, revenue: 0, joinedDate: '10 May 2026' },
  { id: 'V002', name: 'Kathmandu Electronics', category: 'Electronics', email: 'info@ktmelectronics.np', status: 'PENDING', products: 0, revenue: 0, joinedDate: '9 May 2026' },
  { id: 'V003', name: 'Nepal Organics', category: 'Food & Grocery', email: 'organic@nepal.np', status: 'PENDING', products: 0, revenue: 0, joinedDate: '8 May 2026' },
  { id: 'V004', name: 'Pokhara Textiles', category: 'Clothing', email: 'sales@pokharatex.np', status: 'PENDING', products: 0, revenue: 0, joinedDate: '7 May 2026' },
  { id: 'V005', name: 'Everest Outdoors', category: 'Sports & Outdoors', email: 'gear@everestoutdoors.np', status: 'APPROVED', products: 84, revenue: 245000000, joinedDate: '2 Apr 2026' },
  { id: 'V006', name: 'Annapurna Books', category: 'Books & Stationery', email: 'books@annapurna.np', status: 'APPROVED', products: 312, revenue: 98500000, joinedDate: '15 Mar 2026' },
  { id: 'V007', name: 'Bagmati Fashion', category: 'Clothing', email: 'style@bagmatifashion.np', status: 'APPROVED', products: 156, revenue: 178000000, joinedDate: '10 Feb 2026' },
  { id: 'V008', name: 'Chitwan Spices', category: 'Food & Grocery', email: 'spice@chitwan.np', status: 'APPROVED', products: 47, revenue: 56200000, joinedDate: '5 Jan 2026' },
  { id: 'V009', name: 'Mustang Wines', category: 'Beverages', email: 'wine@mustang.np', status: 'APPROVED', products: 23, revenue: 84700000, joinedDate: '18 Dec 2025' },
  { id: 'V010', name: 'Lumbini Pottery', category: 'Home Décor', email: 'art@lumbini.np', status: 'REJECTED', products: 0, revenue: 0, joinedDate: '1 May 2026' },
  { id: 'V011', name: 'Pashupatinath Gems', category: 'Jewellery', email: 'gems@pashupati.np', status: 'REJECTED', products: 0, revenue: 0, joinedDate: '28 Apr 2026' },
  { id: 'V012', name: 'Boudha Handicrafts', category: 'Handicrafts', email: 'crafts@boudha.np', status: 'APPROVED', products: 91, revenue: 132000000, joinedDate: '22 Nov 2025' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRs(paisa: number) {
  if (paisa === 0) return '—'
  const rupees = paisa / 100
  return 'Rs. ' + rupees.toLocaleString('en-IN')
}

type FilterTab = 'ALL' | VendorStatus

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

const statusBadge: Record<VendorStatus, string> = {
  PENDING: 'badge bg-amber-100 text-amber-700',
  APPROVED: 'badge bg-green-100 text-green-700',
  REJECTED: 'badge bg-red-100 text-red-700',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')

  const counts = {
    ALL: vendors.length,
    PENDING: vendors.filter((v) => v.status === 'PENDING').length,
    APPROVED: vendors.filter((v) => v.status === 'APPROVED').length,
    REJECTED: vendors.filter((v) => v.status === 'REJECTED').length,
  }

  const filtered = activeTab === 'ALL' ? vendors : vendors.filter((v) => v.status === activeTab)

  function approve(id: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'APPROVED' } : v)))
  }

  function reject(id: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'REJECTED' } : v)))
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header + stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Vendors</h2>
          <p className="text-sm text-ink-3 mt-0.5">Manage and approve vendor applications</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-3" />
            {counts.ALL} total
          </div>
          <div className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {counts.PENDING} pending
          </div>
          <div className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {counts.APPROVED} approved
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-paper-2 rounded-xl w-fit border border-line-soft">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-paper shadow-card text-ink'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-crimson' : 'text-ink-3'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line-soft bg-paper-2/60">
              <tr>
                {['Vendor', 'Category', 'Email', 'Products', 'Revenue', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-paper-2/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-ink">{vendor.name}</p>
                      <p className="text-xs text-ink-3 mt-0.5">Joined {vendor.joinedDate}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="chip">{vendor.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-2">{vendor.email}</td>
                  <td className="px-5 py-3.5 font-mono text-ink-2">
                    {vendor.products > 0 ? vendor.products : '—'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-ink">{formatRs(vendor.revenue)}</td>
                  <td className="px-5 py-3.5">
                    <span className={statusBadge[vendor.status]}>{vendor.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {vendor.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approve(vendor.id)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(vendor.id)}
                          className="btn-ghost text-xs px-3 py-1.5 text-crimson hover:bg-crimson/8"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {vendor.status === 'APPROVED' && (
                      <button className="btn-ghost text-xs px-3 py-1.5">View</button>
                    )}
                    {vendor.status === 'REJECTED' && (
                      <button
                        onClick={() => approve(vendor.id)}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-3 text-sm">
            No vendors in this category.
          </div>
        )}
      </div>
    </div>
  )
}
