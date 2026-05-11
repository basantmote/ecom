'use client'

export default function DeliveryHome() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🛵</div>
        <h1 className="text-xl font-bold text-gray-900">EcomNP Delivery</h1>
        <p className="text-gray-500 mt-2 text-sm">Accept and manage deliveries</p>
        <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold">
          Go Online
        </button>
      </div>
    </main>
  )
}
