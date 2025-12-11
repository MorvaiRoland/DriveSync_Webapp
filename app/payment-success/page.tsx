import Link from 'next/link'
import SuccessModal from '@/components/SuccessModal' // A meglévő modalodat használjuk újra

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      {/* Ez a komponens dobja a konfettit és a popupot */}
      <SuccessModal />
      
      {/* Fallback tartalom, ha a modal valamiért nem nyílna meg */}
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-4">Sikeres fizetés!</h1>
        <Link href="/" className="text-amber-500 hover:underline">Vissza a főoldalra</Link>
      </div>
    </div>
  )
}