import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/img/home01.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />

        <div className="relative z-10 container mx-auto px-6 max-w-2xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm text-white text-sm font-semibold mb-8">
            <Zap className="w-4 h-4 text-green-400" />
            ผู้ช่วยภาษีอัจฉริยะ พร้อมให้บริการแล้ว
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xl mb-6">
            ทำให้การยื่นภาษี<br />
            <span className="text-green-400">ง่าย รวดเร็ว</span> และไม่ซับซ้อน
          </h1>

          <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            ไม่ต้องกังวลเรื่องการยื่นภาษีอีกต่อไป ระบบ AI ของเราช่วยคำนวณและแนะนำสิทธิประโยชน์ที่คุณควรได้รับแบบอัตโนมัติ
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/tax-calculator"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-green-500/30 hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
            >
              เริ่มใช้งานฟรี <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 rounded-full font-bold text-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              เรียนรู้เพิ่มเติม
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
          <div className="w-px h-12 bg-white animate-bounce" />
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-gray-950 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            {[
              { value: '10,000+', label: 'ผู้ใช้งาน' },
              { value: '99.9%',   label: 'ความแม่นยำ' },
              { value: '24/7',    label: 'พร้อมให้บริการ' },
            ].map((s) => (
              <div key={s.label} className="px-2 sm:px-6">
                <div className="text-lg sm:text-3xl font-extrabold text-green-400">{s.value}</div>
                <div className="text-xs sm:text-sm text-white/55 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <span className="text-sm font-bold text-green-600 uppercase tracking-widest">ทำไมต้องเลือกเรา</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 mt-2 mb-4 tracking-tight">ครบ เร็ว และเชื่อถือได้</h2>
            <p className="text-gray-500 font-light leading-relaxed">
              เทคโนโลยีที่ทันสมัยรวมกับความเข้าใจในกฎหมายภาษีไทยอย่างลึกซึ้ง
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: Target,
                title: 'แม่นยำและครบถ้วน',
                desc: 'อัปเดตกฎหมายภาษีล่าสุดเสมอ มั่นใจได้ในความถูกต้องของการคำนวณทุกครั้ง',
              },
              {
                Icon: Zap,
                title: 'รวดเร็วและใช้ง่าย',
                desc: 'ลดขั้นตอนที่ยุ่งยาก เพียงกรอกข้อมูล ระบบจัดการส่วนที่เหลือให้คุณโดยอัตโนมัติ',
              },
              {
                Icon: ShieldCheck,
                title: 'ปลอดภัยสูงสุด',
                desc: 'ข้อมูลของคุณถูกเข้ารหัสและปกป้องด้วยมาตรฐานความปลอดภัยระดับสากล',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group p-5 sm:p-8 rounded-3xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-green-50 group-hover:bg-green-100 rounded-2xl flex items-center justify-center mb-6 border border-green-100 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-5 tracking-tight">
            พร้อมเริ่มต้นวางแผนภาษีของคุณแล้วหรือยัง?
          </h2>
          <p className="text-white/80 text-lg font-light mb-10">
            เริ่มใช้งานได้ทันที ไม่ต้องติดตั้ง ไม่มีค่าใช้จ่ายซ่อนเร้น
          </p>
          <Link
            href="/tax-calculator"
            className="inline-flex items-center gap-2 px-8 sm:px-12 py-3.5 sm:py-4 bg-white text-green-700 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            เริ่มคำนวณภาษี <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
