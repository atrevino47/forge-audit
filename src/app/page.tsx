import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustSignals } from '@/components/landing/TrustSignals';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Categories } from '@/components/landing/Categories';
import { CTASection } from '@/components/landing/CTASection';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustSignals />
        <HowItWorks />
        <Categories />
        <CTASection />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

