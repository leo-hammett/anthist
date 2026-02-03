import { useState, type FormEvent } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In production, this would submit to your form handler
    setSubmitted(true);
  };

  return (
    <section id="get-started" className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 tracking-tight mb-6">
          Join the movement
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Be part of the generation that reclaims control over attention. 
          Start testing the beta today and help shape the future of mindful content consumption.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="https://testflight.apple.com/join/D65MzCe9"
            target="_blank"
            rel="noopener noreferrer"
            className="group gradient-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            Download Beta on TestFlight
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        <p className="text-sm text-gray-500">
          Available for iPhone and iPad • Requires iOS 16 or later
        </p>

        {!submitted && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <p className="text-lg text-gray-600 mb-6">
              Want to stay updated? Join our mailing list:
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-full border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="gradient-accent text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Join our community of mindful readers. No spam, ever.
              </p>
            </form>
          </div>
        )}

        {submitted && (
          <div className="mt-12 inline-flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You're on the list! We'll be in touch soon.
          </div>
        )}
      </div>
    </section>
  );
}
