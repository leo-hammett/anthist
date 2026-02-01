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
          Ready to reclaim your attention?
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join the first 1,000 users and get free access to the Anthist cloud 
          service. No credit card required.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You're on the list! We'll be in touch soon.
          </div>
        ) : (
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
                Get Early Access
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free for 1,000 users. No spam, unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
