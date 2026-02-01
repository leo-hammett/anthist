export default function LogoCloud() {
  const logos = [
    { name: 'TechCrunch', color: '#0A9E01' },
    { name: 'Product Hunt', color: '#DA552F' },
    { name: 'Hacker News', color: '#FF6600' },
    { name: 'The Verge', color: '#EC008C' },
    { name: 'Wired', color: '#000000' },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-gray-500 text-sm font-medium mb-8 uppercase tracking-wider">
          Loved by readers from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="text-2xl font-bold opacity-30 hover:opacity-60 transition-opacity cursor-default"
              style={{ color: logo.color }}
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
