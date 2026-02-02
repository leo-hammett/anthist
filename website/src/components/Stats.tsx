const stats = [
  { value: '3.5hrs', label: 'Average daily screen time lost to algorithms' },
  { value: '100%', label: 'Open source codebase' },
  { value: '4.5B', label: 'People affected by attention economy' },
  { value: '∞', label: 'Long-term commitment to this mission' },
];

const missionPoints = [
  {
    title: 'A Long-Horizon Mission',
    description:
      'This isn\'t a quick startup flip. We\'re building infrastructure for a fundamental shift in how humanity consumes content—a decade-long commitment to ethical technology.',
  },
  {
    title: 'Reclaiming the Attention Economy',
    description:
      'Big tech has weaponized psychology against users. We\'re leading the counter-movement, proving that technology can serve human flourishing, not exploit it.',
  },
  {
    title: 'Open Source Foundation',
    description:
      'By building in the open, we ensure this movement outlives any single company. The tools to reclaim attention should belong to everyone.',
  },
  {
    title: 'Measurable Impact',
    description:
      'Every hour saved from doomscrolling is an hour returned to creativity, learning, and connection. We\'re building tools to quantify and maximize this impact.',
  },
];

export default function Stats() {
  return (
    <section id="mission" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">
            Our Mission
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            Leading the push to reclaim attention
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            The attention economy has cost humanity billions of hours. 
            We're building the tools to take it back.
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

        {/* Mission Points */}
        <div className="grid md:grid-cols-2 gap-8">
          {missionPoints.map((point, index) => (
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
