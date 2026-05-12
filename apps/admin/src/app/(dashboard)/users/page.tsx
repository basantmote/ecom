'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Role = 'CUSTOMER' | 'VENDOR' | 'DELIVERY' | 'ADMIN'
type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'

interface User {
  id: string
  email: string | null
  phone: string | null
  role: Role
  status: UserStatus
  createdAt: string
  profile: { fullName: string; avatarUrl: string | null } | null
  _count: { orders: number }
}

const roleColors: Record<Role, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-700',
  VENDOR: 'bg-amber-100 text-amber-700',
  DELIVERY: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-crimson/10 text-crimson',
}

const statusColors: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', status: '' as UserStatus })
  const [newPassword, setNewPassword] = useState('')
  const [resetDone, setResetDone] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      const res = await api.get(`/admin/users?${params}`)
      return res.data as { data: User[]; meta: { total: number; totalPages: number } }
    },
  })

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, string> }) =>
      api.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setEditUser(null)
    },
  })

  const resetPassword = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      api.post(`/admin/users/${id}/reset-password`, { newPassword }),
    onSuccess: () => {
      setResetDone(true)
    },
  })

  function openEdit(user: User) {
    setEditUser(user)
    setEditForm({
      fullName: user.profile?.fullName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      status: user.status,
    })
  }

  function openReset(user: User) {
    setResetUser(user)
    setNewPassword('')
    setResetDone(false)
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    const body: Record<string, string> = {}
    if (editForm.fullName) body['fullName'] = editForm.fullName
    if (editForm.email) body['email'] = editForm.email
    if (editForm.phone) body['phone'] = editForm.phone
    if (editForm.status) body['status'] = editForm.status
    updateUser.mutate({ id: editUser.id, body })
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetUser || newPassword.length < 8) return
    resetPassword.mutate({ id: resetUser.id, newPassword })
  }

  const users = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Users</h1>
          <p className="text-sm text-ink-3 mt-0.5">{meta ? `${meta.total} total users` : 'Loading…'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name, email or phone…"
          className="input-field max-w-xs"
        />
        <div className="flex gap-1">
          {(['ALL', 'CUSTOMER', 'VENDOR', 'DELIVERY', 'ADMIN'] as const).map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r ? 'bg-crimson text-white' : 'bg-paper-2 text-ink-2 hover:bg-paper-3'
              }`}>
              {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-14 animate-pulse bg-paper-2" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper-2 border-b border-line-soft">
                <tr>
                  {['User', 'Contact', 'Role', 'Orders', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-paper-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ink/8 flex items-center justify-center text-xs font-bold text-ink-2 shrink-0">
                          {(user.profile?.fullName ?? user.email ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{user.profile?.fullName ?? '—'}</p>
                          <p className="text-xs text-ink-3 font-mono">{user.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink">{user.email ?? '—'}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{user.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink">{user._count.orders || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[user.status]}`}>
                        {user.status === 'PENDING_VERIFICATION' ? 'PENDING' : user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-NP')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(user)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => openReset(user)} className="btn-ghost text-xs py-1.5 px-3 text-crimson hover:bg-crimson/8">Reset PW</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-center py-12 text-ink-3 text-sm">No users found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-ink-3">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-ghost text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-paper rounded-2xl shadow-float border border-line-soft w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="font-semibold text-ink">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="btn-icon">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="input-field"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="input-field"
                  placeholder="+977-98XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as UserStatus }))}
                  className="input-field"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                </select>
              </div>
              {updateUser.isError && (
                <p className="text-sm text-crimson">Failed to update user. Please try again.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={updateUser.isPending} className="btn-primary flex-1 disabled:opacity-60">
                  {updateUser.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-paper rounded-2xl shadow-float border border-line-soft w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="font-semibold text-ink">Reset Password</h2>
              <button onClick={() => setResetUser(null)} className="btn-icon">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-ink-2 mb-1">
                Setting a new password for <span className="font-medium text-ink">{resetUser.profile?.fullName ?? resetUser.email}</span>.
              </p>
              <p className="text-xs text-ink-3 mb-4">All existing sessions will be invalidated.</p>

              {resetDone ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium text-sm">Password reset successfully.</p>
                  <p className="text-xs text-green-600 mt-1">The user's sessions have been revoked.</p>
                  <button onClick={() => setResetUser(null)} className="btn-primary mt-4 text-sm">Done</button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      className="input-field"
                      required
                    />
                  </div>
                  {resetPassword.isError && (
                    <p className="text-sm text-crimson">Reset failed. Please try again.</p>
                  )}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setResetUser(null)} className="btn-ghost flex-1">Cancel</button>
                    <button type="submit" disabled={resetPassword.isPending || newPassword.length < 8} className="btn-primary flex-1 disabled:opacity-60">
                      {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
