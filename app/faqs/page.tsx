import Navbar from "@/components/ui/navbar"
import { FAQsCarousel } from "@/components/ui/faqs-carousel"

export default function FAQsPage() {
  return (
    <div className="min-h-screen ">
      <Navbar />
      <main className="py-12 px-4">
        <FAQsCarousel />
      </main>
    </div>
  )
}
