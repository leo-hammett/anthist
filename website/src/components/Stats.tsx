const stats = [
  { value: '$240', label: 'Cost to serve 1,000 users/month' },
  { value: '100%', label: 'Open source codebase' },
  { value: '1,000', label: 'Free users before monetization' },
  { value: '4.5B', label: 'Digital wellness market size' },
];

const investorPoints = [
  {
    title: 'Growing Market',
    description:
      'Digital wellness is a $4.5B market growing 20% annually. Users are actively seeking tools to combat algorithm addiction.',
  },
  {
    title: 'Low Infrastructure Costs',
    description:
      'Serverless architecture on AWS means near-zero costs at low scale, with predictable linear growth.',
  },
  {
    title: 'Open Source Moat',
    description:
      'Community-driven development builds trust and loyalty. Hosting the cloud service creates a natural SaaS opportunity.',
  },
  {
    title: 'Premium Upsell Path',
    description:
      "Quote maker, advanced analytics, family sharing—clear premium features that don't compromise the core free experience.",
  },
];

export default function Stats() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">
            For Investors
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            The numbers speak for themselves
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            The mindful content consumption market is growing as users seek 
            alternatives to addictive algorithms.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Investor Points */}
        <div className="grid md:grid-cols-2 gap-8">
          {investorPoints.map((point, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-xl bg-gray-50 hover-lift"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full gradient-accent flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{point.title}</h4>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
