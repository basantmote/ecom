export default function VendorDashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your store, products, orders, and settlements.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {['Total Orders', 'Revenue', 'Pending Settlement', 'Products'].map((label) => (
            <div key={label} className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">—</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
