// app/page.tsx
import Image from 'next/image';
import Footer from './components/Footer';
import Header from './components/Header';
import HomeArticles from './components/HomeArticles';
import { ArrowRight, Zap, Target, ShieldCheck, Banknote, BookOpenText, ClipboardList, Calculator, FileCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section - Clean Gradient & Modern Style */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6 border border-green-200 shadow-sm">
            <Zap className="w-4 h-4 mr-2" />
            ผู้ช่วยภาษีอัจฉริยะ ใหม่ล่าสุด!
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-950 mb-6 max-w-4xl mx-auto">
            C-Advisor คำนวณภาษี<br /><span className="text-green-700">ง่าย รวดเร็ว</span> และไม่ซับซ้อน
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            หมดกังวลเรื่องยื่นภาษี ระบบ AI ของเราช่วยวางแผนและแนะนำสิทธิประโยชน์ทางภาษีสูงสุดให้คุณโดยอัตโนมัติ
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-5">
            <a href="/homepage/chatbot" className="text-white px-12 py-4 bg-green-600 rounded-full font-bold shadow-md hover:bg-green-700 transition-all transform hover:-translate-y-0.5 flex items-center justify-center text-lg">
              เริ่มใช้งานฟรี <ArrowRight className="ml-2.5 w-5 h-5" />
            </a>
            <a href="/articles" className="text-gray-900 px-12 py-4 bg-white border border-gray-200 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 text-lg">
              เรียนรู้เพิ่มเติม
            </a>
          </div>

          {/* How it works - visual steps */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            {[
              { icon: ClipboardList, step: '01', title: 'กรอกข้อมูลรายได้', desc: 'กรอกเงินเดือนและรายได้อื่นๆ ของคุณ' },
              { icon: Calculator, step: '02', title: 'เลือกสิทธิลดหย่อน', desc: 'ระบบแนะนำสิทธิที่คุณมีสิทธิ์ใช้' },
              { icon: FileCheck, step: '03', title: 'รับผลลัพธ์ทันที', desc: 'ดูภาษีที่ต้องจ่ายหรือได้คืนแบบทันที' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-11 h-11 shrink-0 bg-green-100 rounded-2xl flex items-center justify-center border border-green-200">
                  <Icon className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-green-500 tracking-widest">{step}</span>
                  <h4 className="text-sm font-bold text-gray-900 mt-0.5">{title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Abstract Background Element for Modern Touch */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-100/50 rounded-full blur-3xl opacity-60 z-0"></div>
      </section>

      {/* Features Section - Flat & Icon based */}
      <section className="py-20 md:py-28 bg-gray-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">จุดเด่นของเรา</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 mb-5 tracking-tight">ทำไมต้องเลือก C-Advisor</h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              เรานำเทคโนโลยีมาช่วยให้การจัดการภาษีเป็นเรื่องง่าย ปลอดภัย และเกิดประโยชน์สูงสุดต่อคุณ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Target} 
              title="แม่นยำและครบถ้วน" 
              description="ระบบอัปเดตกฎหมายภาษีล่าสุดเสมอ มั่นใจได้ในความถูกต้องของการคำนวณ"
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="ปลอดภัยมาตรฐานสากล" 
              description="ข้อมูลของคุณถูกเข้ารหัสและปกป้องด้วยระบบรักษาความปลอดภัยขั้นสูง"
            />
            <FeatureCard 
              icon={Zap} 
              title="ใช้งานง่าย ประหยัดเวลา" 
              description="ลดขั้นตอนที่ยุ่งยาก เพียงกรอกข้อมูล ระบบจะจัดการส่วนที่เหลือให้คุณ"
            />
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <HomeArticles />

      {/* Service Section - Clean Cards with Icons */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">บริการของเรา</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 mb-5 tracking-tight">ครอบคลุมทุกความต้องการด้านภาษี</h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              ไม่ว่าคุณจะเป็นมือใหม่หรือผู้ประกอบการ เรามีเครื่องมือที่พร้อมช่วยเหลือคุณ
            </p>
          </div>
          
          <div className="flex flex-col gap-8">
            {/* Featured card - full width */}
            <ServiceCard 
              icon={Zap}
              imageSrc="/1.png"
              title="แชทบอท AI ที่ปรึกษาภาษี"
              description="ถามคำถามภาษีได้ทุกเรื่อง ระบบ AI ของเราพร้อมตอบและให้คำแนะนำแบบเรียลไทม์ตลอด 24 ชั่วโมง"
              linkText="เริ่มแชทเลย"
              linkUrl="homepage/chatbot"
              featured
            />
            {/* Two cards side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ServiceCard 
                icon={Banknote}
                title="คำนวณและยื่นภาษีออนไลน์"
                description="สรุปยอดภาษีที่ต้องชำระหรือได้รับคืน พร้อมแนะนำขั้นตอนการยื่นแบบฯ ที่ง่ายดาย"
                linkText="คำนวณเลย"
                linkUrl="tax-calculator" 
              />
              <ServiceCard 
                icon={BookOpenText}
                title="คลังความรู้ภาษี"
                description="บทความและคู่มือภาษีที่เข้าใจง่าย สำหรับบุคคลธรรมดาและฟรีแลนซ์"
                linkText="อ่านบทความ"
                linkUrl="articles" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Reusable Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-7 border border-green-100">
        <Icon className="w-7 h-7 text-green-600" />
      </div>
      <h3 className="text-lg sm:text-2xl font-bold text-gray-950 mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-600 leading-relaxed font-light">
        {description}
      </p>
    </div>
  );
}

// Reusable Service Card Component
interface ServiceCardProps {
  icon: React.ElementType;
  imageSrc?: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  featured?: boolean;
}

function ServiceCard({ icon: Icon, imageSrc, title, description, linkText, linkUrl, featured }: ServiceCardProps) {
  return (
    <div className={`bg-white p-5 sm:p-8 rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full ${
      featured
        ? 'border-green-200 bg-gradient-to-r from-green-50 to-white md:flex-row md:items-center md:gap-10 hover:border-green-300'
        : 'border-gray-100 hover:border-green-100'
    }`}>
        <div className={`flex items-center mb-6 ${featured ? 'md:mb-0 md:shrink-0' : ''}`}>
            <div className={`${imageSrc ? 'w-16 h-16' : 'w-12 h-12 bg-green-50 border border-green-100 shadow-inner'} rounded-xl flex items-center justify-center mr-5`}>
                {imageSrc
                  ? <Image src={imageSrc} alt={title} width={64} height={64} className="w-full h-full object-contain rounded-xl" />
                  : <Icon className="w-6 h-6 text-green-600" />}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight flex-1 md:hidden">{title}</h3>
        </div>
        <div className={`flex flex-col flex-grow ${featured ? 'md:flex-row md:items-center md:gap-10' : ''}`}>
        <div className="flex-grow">
          <h3 className="hidden md:block text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">{title}</h3>
      
          <p className="text-gray-600 mb-8 leading-relaxed font-light">
            {description}
          </p>
        </div>
        <div className={`${featured ? 'md:shrink-0' : 'mt-auto'}`}>
          <a
            href={linkUrl}
            className="bg-gray-900 text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow inline-flex items-center group text-sm"
          >
            {linkText} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        </div>
    </div>
  );
}