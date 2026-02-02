export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse-glow animation-delay-800" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <div className="animate-slide-up opacity-0">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Open Source Movement for Digital Wellness
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up opacity-0 animation-delay-200 text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-gray-900 mb-6">
          Your Personal
          <br />
          <span className="gradient-text">Anthology</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-slide-up opacity-0 animation-delay-400 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Reclaiming the attention economy, one reader at a time. 
          A feed for content you actually choose—an ethical algorithm that 
          serves you, no dark patterns, just mindful consumption.
        </p>

        {/* CTA Buttons */}
        <div className="animate-slide-up opacity-0 animation-delay-600 flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#get-started"
            className="group gradient-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            Get Early Access
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="https://github.com/leo-hammett/anthist"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* App Preview */}
        <div className="animate-slide-up opacity-0 animation-delay-800 relative">
          <div className="relative mx-auto max-w-4xl">
            {/* Browser mockup */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-200">
              {/* Browser header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    anthist.com
                  </div>
                </div>
              </div>
              {/* App content */}
              <div className="bg-[#0a0a0a] aspect-video flex items-center justify-center">
                <div className="max-w-2xl px-8 py-12">
                  <h3 className="font-serif text-3xl md:text-4xl text-white font-semibold mb-6 leading-tight">
                    The Art of Doing Nothing
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    In our hyper-connected world, we've forgotten how to simply exist. 
                    The constant barrage of notifications, updates, and algorithmic 
                    recommendations has trained us to always be consuming something...
                  </p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      5 min read
                    </span>
                    <span>•</span>
                    <span>← Swipe for next article →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -right-8 top-1/4 bg-white rounded-xl shadow-xl p-4 animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">100+ themes</div>
                  <div className="text-gray-500 text-xs">Beautiful reading</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-8 bottom-1/4 bg-white rounded-xl shadow-xl p-4 animate-float animation-delay-400 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Ethical AI</div>
                  <div className="text-gray-500 text-xs">Serves you, not ads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
