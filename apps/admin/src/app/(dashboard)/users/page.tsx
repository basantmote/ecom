'use client'

import { useState } from 'react'

type Role = 'CUSTOMER' | 'VENDOR' | 'DELIVERY' | 'ADMIN'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  orders: number
  joined: string
  status: 'ACTIVE' | 'SUSPENDED'
}

const USERS: User[] = [
  { id: 'U001', name: 'Priya Sharma', email: 'priya@example.com', phone: '+977-9841001001', role: 'CUSTOMER', orders: 14, joined: '12 Jan 2026', status: 'ACTIVE' },
  { id: 'U002', name: 'Ramesh Thapa', email: 'ramesh@techub.np', phone: '+977-9841002002', role: 'VENDOR', orders: 0, joined: '3 Feb 2026', status: 'ACTIVE' },
  { id: 'U003', name: 'Sita Gurung', email: 'sita@example.com', phone: '+977-9841003003', role: 'CUSTOMER', orders: 7, joined: '20 Feb 2026', status: 'ACTIVE' },
  { id: 'U004', name: 'Bikash KC', email: 'bikash@delivery.np', phone: '+977-9841004004', role: 'DELIVERY', orders: 0, joined: '1 Mar 2026', status: 'ACTIVE' },
  { id: 'U005', name: 'Anita Rai', email: 'anita@example.com', phone: '+977-9841005005', role: 'CUSTOMER', orders: 3, joined: '8 Mar 2026', status: 'SUSPENDED' },
  { id: 'U006', name: 'Suresh Lama', email: 'suresh@sports.np', phone: '+977-9841006006', role: 'VENDOR', orders: 0, joined: '15 Mar 2026', status: 'ACTIVE' },
  { id: 'U007', name: 'Nisha Maharjan', email: 'nisha@example.com', phone: '+977-9841007007', role: 'CUSTOMER', orders: 22, joined: '2 Apr 2026', status: 'ACTIVE' },
  { id: 'U008', name: 'Dipak Shrestha', email: 'dipak@delivery.np', phone: '+977-9841008008', role: 'DELIVERY', orders: 0, joined: '10 Apr 2026', status: 'ACTIVE' },
  { id: 'U009', name: 'Kamala Tamang', email: 'kamala@example.com', phone: '+977-9841009009', role: 'CUSTOMER', orders: 5, joined: '18 Apr 2026', status: 'ACTIVE' },
  { id: 'U010', name: 'Admin User', email: 'admin@hamrobazaar.com', phone: '+977-9841000000', role: 'ADMIN', orders: 0, joined: '1 Jan 2026', status: 'ACTIVE' },
]

const roleColors: Record<Role, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-700',
  VENDOR: 'bg-amber-100 text-amber-700',
  DELIVERY: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-crimson/10 text-crimson',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Users</h1>
          <p className="text-sm text-ink-3 mt-0.5">{USERS.length} total users</p>
        </div>
        <button className="btn-primary">+ Invite Admin</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['CUSTOMER', 'VENDOR', 'DELIVERY', 'ADMIN'] as Role[]).map((role) => {
          const count = USERS.filter((u) => u.role === role).length
          return (
            <div key={role} className="card p-4">
              <p className="font-mono text-2xl font-bold text-ink">{count}</p>
              <p className="text-xs text-ink-3 mt-0.5 capitalize">{role.toLowerCase()}s</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field max-w-xs"
        />
        <div className="flex gap-1">
          {(['ALL', 'CUSTOMER', 'VENDOR', 'DELIVERY', 'ADMIN'] as const).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r ? 'bg-crimson text-white' : 'bg-paper-2 text-ink-2 hover:bg-paper-3'
              }`}>
              {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-2">
              <tr>
                {['User', 'Contact', 'Role', 'Orders', 'Joined', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-paper-2/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ink/8 flex items-center justify-center text-xs font-bold text-ink-2 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{user.name}</p>
                        <p className="text-xs text-ink-3">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink text-xs">{user.email}</p>
                    <p className="text-ink-3 text-xs mt-0.5">{user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${roleColors[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-ink">{user.orders || '—'}</td>
                  <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">{user.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn-ghost text-xs py-1.5 px-3">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
