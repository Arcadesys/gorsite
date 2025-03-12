import Link from "next/link";
import PlaceholderArt from "@/components/PlaceholderArt";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 z-10"></div>
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 z-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            <span className="text-pink-400">GORATH</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Digital Artist & Illustrator specializing in fantasy, sci-fi, and character art
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/commissions" 
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Commission Me
            </Link>
            <Link 
              href="/gallery" 
              className="bg-transparent hover:bg-white/10 text-white border border-white font-bold py-3 px-8 rounded-full transition"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-400">Featured Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-pink-500/20 transition">
                <div className="relative h-64">
                  <PlaceholderArt width={400} height={256} className="w-full h-full" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-pink-400">Artwork Title {item}</h3>
                  <p className="text-gray-400 mb-4">Fantasy character illustration</p>
                  <Link href="/gallery" className="text-pink-400 hover:text-pink-300 transition">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/gallery" 
              className="bg-transparent hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-600 font-bold py-3 px-8 rounded-full transition"
            >
              View All Works
            </Link>
          </div>
        </div>
      </section>

      {/* Commission Info */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-400">Commission Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-4 text-pink-400">Character Sketches</h3>
              <p className="text-gray-300 mb-4">Quick character sketches and concept art</p>
              <p className="text-3xl font-bold text-white mb-6">$50+</p>
              <Link 
                href="/commissions" 
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition block"
              >
                Order Now
              </Link>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg text-center transform scale-105 border border-pink-500 shadow-lg shadow-pink-500/20">
              <div className="bg-pink-600 text-white py-1 px-4 rounded-full text-sm font-bold inline-block mb-4">POPULAR</div>
              <h3 className="text-2xl font-bold mb-4 text-pink-400">Full Character Art</h3>
              <p className="text-gray-300 mb-4">Detailed character illustrations with background</p>
              <p className="text-3xl font-bold text-white mb-6">$150+</p>
              <Link 
                href="/commissions" 
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition block"
              >
                Order Now
              </Link>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-4 text-pink-400">Scene Illustrations</h3>
              <p className="text-gray-300 mb-4">Complex scenes with multiple characters</p>
              <p className="text-3xl font-bold text-white mb-6">$300+</p>
              <Link 
                href="/commissions" 
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition block"
              >
                Order Now
              </Link>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/commissions" 
              className="bg-transparent hover:bg-white/10 text-white border border-white font-bold py-3 px-8 rounded-full transition"
            >
              View All Commission Options
            </Link>
          </div>
        </div>
      </section>

      {/* Social Feed Preview */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-400">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((item) => (
              <div key={item} className="bg-black p-6 rounded-lg flex gap-4">
                <div className="w-16 h-16 rounded-full bg-pink-600 flex-shrink-0 flex items-center justify-center text-white">
                  {item === 1 ? "🐦" : "📸"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-pink-400">
                      {item === 1 ? "Twitter" : "Instagram"}
                    </h3>
                    <span className="text-gray-500 text-sm">2 days ago</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Just finished this new character design! What do you think? #digitalart #characterdesign
                  </p>
                  <a 
                    href="#" 
                    className="text-pink-400 hover:text-pink-300 text-sm transition"
                  >
                    View Original Post →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/feed" 
              className="bg-transparent hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-600 font-bold py-3 px-8 rounded-full transition"
            >
              View All Updates
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-900 to-pink-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to bring your ideas to life?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Let&apos;s work together to create something amazing. Get in touch today!
          </p>
          <Link 
            href="/contact" 
            className="bg-white hover:bg-gray-100 text-pink-700 font-bold py-3 px-8 rounded-full transition"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}
