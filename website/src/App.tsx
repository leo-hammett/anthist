import { useEffect, useState } from 'react';
import CookiePolicy from './components/CookiePolicy';
import CTA from './components/CTA';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Navbar from './components/Navbar';
import OpenSource from './components/OpenSource';
import PrivacyPolicy from './components/PrivacyPolicy';
import Problem from './components/Problem';
import Stats from './components/Stats';

type Page = 'home' | 'privacy' | 'cookies';

function getPageFromHash(): Page {
  const hash = window.location.hash;
  if (hash === '#/privacy') return 'privacy';
  if (hash === '#/cookies') return 'cookies';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (page === 'privacy') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PrivacyPolicy />
        <Footer />
      </div>
    );
  }

  if (page === 'cookies') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <CookiePolicy />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Stats />
        <OpenSource />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
