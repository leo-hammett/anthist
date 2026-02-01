const problems = [
  {
    icon: '🎯',
    title: 'Algorithms Control You',
    description:
      "TikTok, YouTube, and Instagram decide what you see based on what keeps you scrolling—not what's actually valuable to you.",
  },
  {
    icon: '⏰',
    title: 'Endless Scrolling',
    description:
      "Infinite feeds are designed to steal your time. There's no natural stopping point, no sense of completion.",
  },
  {
    icon: '🧠',
    title: 'Attention Fragmentation',
    description:
      'Constant recommendations train your brain to expect novelty, making it harder to focus on longer, meaningful content.',
  },
];

export default function Problem() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">
            The Problem
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            Modern content is broken
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Social media algorithms are designed to maximize engagement, 
            not enrich your life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 rounded-2xl p-8 hover-lift border border-transparent hover:border-gray-200"
            >
              <div className="text-5xl mb-6">{problem.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
