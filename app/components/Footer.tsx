// app/components/Footer.tsx
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-6 pb-3">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* ข้อมูลบริษัท */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-lg font-bold">C-Advisor</span>
            </div>
            <p className="text-gray-400 text-xs mb-3 max-w-xs mx-auto md:mx-0">
              แพลตฟอร์มทางการเงินที่ช่วยให้การคำนวณและวางแผนภาษีเป็นเรื่องง่าย
            </p>
            <div className="flex justify-center md:justify-start space-x-2">
              <a href="#" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          
          {/* ลิงก์ด่วน */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-2">เมนูลัด</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">หน้าแรก</a></li>
              <li><a href="/homepage/chatbot" className="hover:text-white transition-colors">แชทบอท</a></li>
              <li><a href="/articles" className="hover:text-white transition-colors">บทความ</a></li>
              <li><a href="/tax-calculator" className="hover:text-white transition-colors">คำนวณภาษี</a></li>
            </ul>
          </div>
          
          {/* ข้อมูลติดต่อ */}
          <div className="text-center md:text-right">
            <h3 className="text-base font-semibold mb-2">ติดต่อเรา</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center justify-center md:justify-end">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-green-400 flex-shrink-0" />
                <span>02-123-4567</span>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-green-400 flex-shrink-0" />
                <span>info@c-advisor.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-400 flex-shrink-0" />
                <span>กรุงเทพฯ</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* ส่วนล่างสุด */}
        <div className="border-t border-gray-800 pt-3 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p className="mb-1 md:mb-0">© {currentYear} C-Advisor. สงวนลิขสิทธิ์</p>
            <a
              href="/admin/login"
              className="text-gray-700 hover:text-gray-500 transition-colors text-xs mb-1 md:mb-0"
              title="Admin"
            >
              Admin
            </a>
            <div className="flex space-x-3">
              <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-white transition-colors">เงื่อนไขการใช้บริการ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;