import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import Hero from '../components/landing/Hero.jsx';
import AboutSection from '../components/landing/AboutSection.jsx';
import CTABanner from '../components/landing/CTABanner.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <CTABanner />
      </main>
      <Footer />
    </motion.div>
  );
}