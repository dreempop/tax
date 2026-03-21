'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const TERMS_KEY = 'cadvisor_terms_accepted';

export default function TermsModal() {
  const [status, setStatus] = useState<'loading' | 'show' | 'accepted' | 'declined'>('loading');

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_KEY);
    setStatus(accepted === 'true' ? 'accepted' : 'show');
  }, []);

  const handleAccept = () => {
    localStorage.setItem(TERMS_KEY, 'true');
    setStatus('accepted');
  };

  const handleDecline = () => {
    setStatus('declined');
  };

  if (status === 'loading' || status === 'accepted') return null;

  if (status === 'declined') {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-red-900/40 rounded-full flex items-center justify-center mb-6">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">ไม่สามารถเข้าใช้งานได้</h2>
        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
          คุณปฏิเสธข้อกำหนดและเงื่อนไขการใช้งาน จึงไม่สามารถเข้าถึงเว็บไซต์ได้<br />
          หากต้องการใช้งาน กรุณากลับไปยอมรับข้อตกลง
        </p>
        <button
          onClick={() => setStatus('show')}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-colors"
        >
          กลับไปอ่านข้อตกลง
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-7 py-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">ข้อกำหนดและเงื่อนไขการใช้งาน</h2>
              <p className="text-green-100 text-xs mt-0.5">CADVISOR — อัปเดตล่าสุด: 21 มีนาคม 2569</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 text-sm text-gray-700 space-y-4 leading-relaxed">
          <p className="text-gray-500 text-xs">ยินดีต้อนรับสู่ CADVISOR โปรดอ่านข้อกำหนดและเงื่อนไขนี้อย่างละเอียดก่อนเข้าใช้งาน</p>

          {[
            {
              num: '1', title: 'ขอบเขตการให้บริการ',
              body: 'CADVISOR ให้บริการข้อมูล ข่าวสาร และเครื่องมือคำนวณภาษีเบื้องต้นเพื่อเป็นแนวทางประกอบการวางแผนภาษีเท่านั้น "มิใช่" บริการให้คำปรึกษาทางกฎหมาย ภาษีอากร หรือวิชาชีพการบัญชีอย่างเป็นทางการ',
            },
            {
              num: '2', title: 'การปฏิเสธความรับผิด (Disclaimer of Warranties)',
              body: 'แม้เราจะพยายามอย่างเต็มที่ในการอัปเดตสูตรคำนวณและข้อกฎหมายภาษีให้เป็นปัจจุบัน แต่ CADVISOR ไม่รับประกันว่าข้อมูลหรือผลลัพธ์จากการคำนวณจะถูกต้อง 100% การนำข้อมูลไปใช้ในการยื่นภาษีจริงถือเป็นความรับผิดชอบของผู้ใช้บริการแต่เพียงผู้เดียว',
            },
            {
              num: '3', title: 'ทรัพย์สินทางปัญญา',
              body: 'เนื้อหา บทความ ซอร์สโค้ด และเครื่องหมายการค้า CADVISOR เป็นสิทธิ์ของผู้พัฒนาแต่เพียงผู้เดียว ห้ามมิให้ผู้ใดคัดลอก ดัดแปลง หรือนำไปใช้ในเชิงพาณิชย์โดยมิได้รับอนุญาตเป็นลายลักษณ์อักษร',
            },
            {
              num: '4', title: 'การคุ้มครองข้อมูลส่วนบุคคล (Privacy)',
              body: 'ข้อมูลส่วนตัว ข้อมูลรายได้ หรือข้อมูลค่าลดหย่อนที่ท่านกรอกในระบบ จะถูกดำเนินการตามนโยบายความเป็นส่วนตัว (Privacy Policy) สอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
            },
            {
              num: '5', title: 'การเชื่อมโยงไปยังเว็บไซต์ภายนอก',
              body: 'เว็บไซต์อาจมีลิงก์ไปยังหน่วยงานภาครัฐ (เช่น กรมสรรพากร) หรือบุคคลที่สาม CADVISOR ไม่รับผิดชอบต่อเนื้อหาหรือความปลอดภัยของเว็บไซต์เหล่านั้น',
            },
            {
              num: '6', title: 'การเปลี่ยนแปลงข้อกำหนด',
              body: 'เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดนี้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า โดยจะมีผลทันทีที่ประกาศบนหน้าเว็บไซต์',
            },
          ].map(({ num, title, body }) => (
            <div key={num}>
              <h3 className="font-semibold text-gray-900 mb-1">{num}. {title}</h3>
              <p className="text-gray-600">{body}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 px-7 py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            ไม่ยอมรับข้อตกลง
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors text-sm shadow-sm"
          >
            ยอมรับข้อตกลง
          </button>
        </div>
      </div>
    </div>
  );
}
