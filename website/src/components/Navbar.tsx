import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-gray-200/50 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="font-serif text-2xl font-bold text-gray-900">
          Anthist
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            How it Works
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Pricing
          </a>
          <a
            href="https://github.com/anthist/anthist"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            GitHub
          </a>
          <a
            href="#get-started"
            className="gradient-accent text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Get Early Access
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-gray-200/50 mt-4">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2">
              Pricing
            </a>
            <a
              href="https://github.com/anthist/anthist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2"
            >
              GitHub
            </a>
            <a
              href="#get-started"
              className="gradient-accent text-white px-6 py-3 rounded-full font-semibold text-center hover:opacity-90 transition-opacity"
            >
              Get Early Access
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
