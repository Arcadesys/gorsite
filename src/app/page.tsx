"use client";

import Link from "next/link";
import PlaceholderArt from "@/components/PlaceholderArt";
import Hero from "@/components/Hero";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const { accentColor, colorMode } = useTheme();
  const c400 = `var(--${accentColor}-400)`;
  const c600 = `var(--${accentColor}-600)`;
  const c700 = `var(--${accentColor}-700)`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Works */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f9fafb' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Featured Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg overflow-hidden shadow-lg transition" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
                <div className="relative h-64">
                  <PlaceholderArt width={400} height={256} className="w-full h-full" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: c400 }}>Artwork Title {item}</h3>
                  <p className={colorMode === 'dark' ? 'text-gray-400 mb-4' : 'text-gray-600 mb-4'}>Fantasy character illustration</p>
                  <Link href="/gallery" className="transition" style={{ color: c400 }}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/gallery" className="font-bold py-3 px-8 rounded-full transition border" style={{ color: c400, borderColor: c600 }}>
              View All Works
            </Link>
          </div>
        </div>
      </section>

      {/* Commission Info */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Commission Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg text-center" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Character Sketches</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Quick character sketches and concept art</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$50+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
            <div className="p-8 rounded-lg text-center transform scale-105 border shadow-lg" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6', borderColor: c600, boxShadow: `0 10px 25px -10px ${colorMode === 'dark' ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)'}` }}>
              <div className="text-white py-1 px-4 rounded-full text-sm font-bold inline-block mb-4" style={{ backgroundColor: c600 }}>POPULAR</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Full Character Art</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Detailed character illustrations with background</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$150+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
            <div className="p-8 rounded-lg text-center" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: c400 }}>Scene Illustrations</h3>
              <p className={colorMode === 'dark' ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>Complex scenes with multiple characters</p>
              <p className="text-3xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>$300+</p>
              <Link 
                href="/commissions" 
                className="text-white font-bold py-2 px-6 rounded-full transition block"
                style={{ backgroundColor: c600 }}
              >
                Order Now
              </Link>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/commissions" className="font-bold py-3 px-8 rounded-full transition border" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>
              View All Commission Options
            </Link>
          </div>
        </div>
      </section>

      {/* Social Feed Preview */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f9fafb' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: c400 }}>Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((item) => (
              <div key={item} className="p-6 rounded-lg flex gap-4" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
                <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ backgroundColor: c600 }}>
                  {item === 1 ? "🐦" : "📸"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold" style={{ color: c400 }}>
                      {item === 1 ? "Twitter" : "Instagram"}
                    </h3>
                    <span className={colorMode === 'dark' ? 'text-gray-500 text-sm' : 'text-gray-600 text-sm'}>2 days ago</span>
                  </div>
                  <p className={colorMode === 'dark' ? 'text-gray-300 mb-2' : 'text-gray-700 mb-2'}>
                    Just finished this new character design! What do you think? #digitalart #characterdesign
                  </p>
                  <a href="#" className="text-sm transition" style={{ color: c400 }}>
                    View Original Post →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/feed" className="font-bold py-3 px-8 rounded-full transition border" style={{ color: c400, borderColor: c600 }}>
              View All Updates
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16" style={{ background: 'linear-gradient(90deg, #064e3b, #047857)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to bring your ideas to life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#d1fae5' }}>
            Let&apos;s work together to create something amazing. Get in touch today!
          </p>
          <Link 
            href="/contact" 
            className="bg-white hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition"
            style={{ color: '#047857' }}
          >
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}
