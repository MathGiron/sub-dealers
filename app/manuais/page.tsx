
import Navbar from "@/components/navbar"
import { ManualsCarousel } from "@/components/ui/manuais-carousel"

export default function ManualsPage() {
  return (
    <div className="min-h-screen ">
      <Navbar />
      <main className="py-12 px-4">
        <ManualsCarousel />
      </main>
    </div>
  )
}