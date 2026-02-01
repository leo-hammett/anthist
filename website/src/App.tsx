import CTA from './components/CTA';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import LogoCloud from './components/LogoCloud';
import Navbar from './components/Navbar';
import OpenSource from './components/OpenSource';
import Problem from './components/Problem';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <Problem />
        <HowItWorks />
        <Features />
        <Stats />
        <Testimonials />
        <OpenSource />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
