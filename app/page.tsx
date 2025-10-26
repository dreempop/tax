// app/page.tsx
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    // ใช้ flexbox และ h-screen เพื่อให้ layout สวยงาม
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}