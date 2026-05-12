'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'

interface VendorDocument {
  id: string
  type: 'PAN' | 'CITIZENSHIP' | 'BUSINESS_REGISTRATION' | 'OTHER'
  fileUrl: string
  verified: boolean
}

interface Vendor {
  id: string
  storeName: string
  slug: string
  logo: string | null
  description: string | null
  commissionRate: number
  bankName: string | null
  bankAccount: string | null
  bankHolder: string | null
  status: VendorStatus
  approvedAt: string | null
  createdAt: string
  user: {
    email: string | null
    phone: string | null
    profile: { fullName: string } | null
  }
  documents: VendorDocument[]
}

const statusBadge: Record<VendorStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  REJECTED: 'bg-red-100 text-red-700',
}

type FilterTab = 'ALL' | VendorStatus
const tabs: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SUSPENDED', label: 'Suspended' },
  { key: 'REJECTED', label: 'Rejected' },
]

function formatRs(paisa: number) {
  if (!paisa) return '—'
  return 'Rs. ' + (paisa / 100).toLocaleString('en-IN')
}

const DOC_LABELS: Record<string, string> = {
  PAN: 'PAN Card',
  CITIZENSHIP: 'Citizenship',
  BUSINESS_REGISTRATION: 'Business Registration',
  OTHER: 'Other Document',
}

export default function VendorsPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', activeTab],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeTab !== 'ALL') params.set('status', activeTab)
      const res = await api.get(`/admin/vendors?${params}`)
      return res.data.data as Vendor[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/vendors/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-vendors'] })
      if (selectedVendor?.id === vars.id) {
        setSelectedVendor((v) => v ? { ...v, status: vars.status as VendorStatus } : null)
      }
    },
  })

  const vendors = data ?? []
  const counts = {
    ALL: vendors.length,
    PENDING: vendors.filter((v) => v.status === 'PENDING').length,
    APPROVED: vendors.filter((v) => v.status === 'APPROVED').length,
    SUSPENDED: vendors.filter((v) => v.status === 'SUSPENDED').length,
    REJECTED: vendors.filter((v) => v.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Vendors</h2>
          <p className="text-sm text-ink-3 mt-0.5">Manage and approve vendor applications</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {counts.PENDING > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {counts.PENDING} pending review
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-paper-2 rounded-xl w-fit border border-line-soft">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key ? 'bg-paper shadow-card text-ink' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {tab.label}
            {activeTab !== 'ALL' || tab.key === 'ALL' ? (
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-crimson' : 'text-ink-3'}`}>
                {counts[tab.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-paper-2" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line-soft bg-paper-2/60">
                <tr>
                  {['Vendor', 'Owner', 'Documents', 'Commission', 'Status', 'Registered', 'Actions'].map((col) => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-paper-2/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {vendor.logo ? (
                          <img src={vendor.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-ink/8 flex items-center justify-center text-xs font-bold text-ink-2">
                            {vendor.storeName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-ink">{vendor.storeName}</p>
                          <p className="text-xs text-ink-3">/{vendor.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-ink">{vendor.user.profile?.fullName ?? '—'}</p>
                      <p className="text-xs text-ink-3">{vendor.user.email ?? vendor.user.phone ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {vendor.documents.length === 0 ? (
                          <span className="text-xs text-ink-3">None</span>
                        ) : vendor.documents.map((doc) => (
                          <span key={doc.id} className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${doc.verified ? 'bg-green-100 text-green-700' : 'bg-paper-3 text-ink-3'}`}>
                            {doc.type.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink">{vendor.commissionRate}%</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[vendor.status]}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-3 whitespace-nowrap">
                      {new Date(vendor.createdAt).toLocaleDateString('en-NP')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="btn-ghost text-xs px-3 py-1.5"
                        >
                          View
                        </button>
                        {vendor.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus.mutate({ id: vendor.id, status: 'APPROVED' })}
                              disabled={updateStatus.isPending}
                              className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: vendor.id, status: 'REJECTED' })}
                              disabled={updateStatus.isPending}
                              className="btn-ghost text-xs px-3 py-1.5 text-crimson hover:bg-crimson/8 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {vendor.status === 'APPROVED' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: vendor.id, status: 'SUSPENDED' })}
                            disabled={updateStatus.isPending}
                            className="btn-ghost text-xs px-3 py-1.5 text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                          >
                            Suspend
                          </button>
                        )}
                        {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
                          <button
                            onClick={() => updateStatus.mutate({ id: vendor.id, status: 'APPROVED' })}
                            disabled={updateStatus.isPending}
                            className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-60"
                          >
                            Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vendors.length === 0 && (
            <div className="py-16 text-center text-ink-3 text-sm">No vendors in this category.</div>
          )}
        </div>
      )}

      {/* Vendor Detail Panel */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedVendor(null)}>
          <div
            className="relative bg-paper h-full w-full max-w-lg shadow-float border-l border-line-soft overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="sticky top-0 bg-paper border-b border-line-soft px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {selectedVendor.logo ? (
                  <img src={selectedVendor.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center text-sm font-bold text-ink-2">
                    {selectedVendor.storeName.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-ink">{selectedVendor.storeName}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[selectedVendor.status]}`}>
                    {selectedVendor.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="btn-icon">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Approval actions */}
              {selectedVendor.status === 'PENDING' && (
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Awaiting Review</p>
                    <p className="text-xs text-amber-600 mt-0.5">Review the details below before approving.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus.mutate({ id: selectedVendor.id, status: 'APPROVED' })}
                      disabled={updateStatus.isPending}
                      className="btn-primary text-sm disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: selectedVendor.id, status: 'REJECTED' })}
                      disabled={updateStatus.isPending}
                      className="px-3 py-2 rounded-lg bg-crimson/10 text-crimson text-sm font-medium hover:bg-crimson/20 transition-colors disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedVendor.status === 'APPROVED' && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-green-800">Approved Vendor</p>
                    {selectedVendor.approvedAt && (
                      <p className="text-xs text-green-600 mt-0.5">Since {new Date(selectedVendor.approvedAt).toLocaleDateString('en-NP')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => updateStatus.mutate({ id: selectedVendor.id, status: 'SUSPENDED' })}
                    disabled={updateStatus.isPending}
                    className="text-sm px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition-colors disabled:opacity-60"
                  >
                    Suspend
                  </button>
                </div>
              )}

              {(selectedVendor.status === 'SUSPENDED' || selectedVendor.status === 'REJECTED') && (
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-800">
                    {selectedVendor.status === 'SUSPENDED' ? 'Vendor is suspended' : 'Application rejected'}
                  </p>
                  <button
                    onClick={() => updateStatus.mutate({ id: selectedVendor.id, status: 'APPROVED' })}
                    disabled={updateStatus.isPending}
                    className="btn-primary text-sm disabled:opacity-60"
                  >
                    Reinstate
                  </button>
                </div>
              )}

              {/* Store Info */}
              <section>
                <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Store Information</h3>
                <div className="card p-4 space-y-3">
                  <Row label="Store Name" value={selectedVendor.storeName} />
                  <Row label="Slug" value={`/${selectedVendor.slug}`} mono />
                  <Row label="Commission Rate" value={`${selectedVendor.commissionRate}%`} />
                  {selectedVendor.description && (
                    <div>
                      <p className="text-xs text-ink-3 mb-1">Description</p>
                      <p className="text-sm text-ink">{selectedVendor.description}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Owner Info */}
              <section>
                <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Owner / Contact</h3>
                <div className="card p-4 space-y-3">
                  <Row label="Full Name" value={selectedVendor.user.profile?.fullName ?? '—'} />
                  <Row label="Email" value={selectedVendor.user.email ?? '—'} />
                  <Row label="Phone" value={selectedVendor.user.phone ?? '—'} />
                  <Row label="Registered" value={new Date(selectedVendor.createdAt).toLocaleDateString('en-NP')} />
                </div>
              </section>

              {/* Bank Details */}
              <section>
                <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Bank / Payment Details</h3>
                <div className="card p-4 space-y-3">
                  {selectedVendor.bankName || selectedVendor.bankAccount || selectedVendor.bankHolder ? (
                    <>
                      <Row label="Bank" value={selectedVendor.bankName ?? '—'} />
                      <Row label="Account Number" value={selectedVendor.bankAccount ?? '—'} mono />
                      <Row label="Account Holder" value={selectedVendor.bankHolder ?? '—'} />
                    </>
                  ) : (
                    <p className="text-sm text-ink-3">No bank details provided yet.</p>
                  )}
                </div>
              </section>

              {/* Documents */}
              <section>
                <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Submitted Documents</h3>
                {selectedVendor.documents.length === 0 ? (
                  <div className="card p-4">
                    <p className="text-sm text-ink-3">No documents uploaded.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedVendor.documents.map((doc) => (
                      <div key={doc.id} className="card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-paper-3 flex items-center justify-center">
                            <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink">{DOC_LABELS[doc.type] ?? doc.type}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${doc.verified ? 'bg-green-100 text-green-700' : 'bg-paper-3 text-ink-3'}`}>
                              {doc.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-xs px-3 py-1.5"
                        >
                          View ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs text-ink-3 shrink-0">{label}</p>
      <p className={`text-sm text-ink text-right ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
