// emails/tax-deadline-notification.tsx
import { Html } from '@react-email/html';
import { Head } from '@react-email/head';
import { Preview } from '@react-email/preview';
import { Tailwind } from '@react-email/tailwind';

interface TaxDeadlineNotificationProps {
  fullName: string;
  deadlineDate: string;
  deadlineDay: string;
  deadlineMonth: string;
  deadlineYear: string;
}

export const TaxDeadlineNotificationEmail = ({
  fullName,
  deadlineDate,
  deadlineDay,
  deadlineMonth,
  deadlineYear,
}: TaxDeadlineNotificationProps) => {
  return (
    <Html>
      <Head>
        <title>แจ้งเตือนกำหนดการจ่ายภาษี</title>
      </Head>
      <Preview>
        แจ้งเตือนกำหนดการยื่นภาษีเงินได้บุคคลธรรมดิษฐ์ ปี 2568
      </Preview>
      <Tailwind>
        <div className="bg-gray-50">
          <div className="max-w-2xl mx-auto bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                📢 แจ้งเตือนสำคัญ
              </h1>
              <p className="text-green-100">
                กำหนดการยื่นภาษีเงินได้บุคคลธรรมดิษฐ์ ปี 2568
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-lg mb-6">
                เรียน คุณ{fullName || "ผู้ใช้งาน"},
              </p>
              
              <p className="text-gray-600 mb-6">
                ขอแจ้งให้ทราบว่ากำหนดการยื่นแบบแสดงรายการภาษีเงินได้บุคคลธรรมดิษฐ์ ปี 2568 ใกล้เข้ามาแล้ว
              </p>

              {/* Deadline Alert */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6 text-center">
                <div className="text-sm font-semibold text-orange-800 mb-2">
                  กำหนดการยื่นแบบแสดงรายการ
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {deadlineDate}
                </div>
                <div className="text-sm text-orange-700">
                  เวลา 23:59 น.
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  📋 สิ่งที่คุณต้องเตรียม
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    หลักฐานการจ่ายเงินเดือนมกราคม - ธันวาคม 2568
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    ใบเสร็จ/หลักฐานรับรู้เงินสำหรับค่าใช้จ่ายที่สามารถนำไปลดหย่นได้
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    เอกสารสิทธิประโยชน์ต่างๆ (เช่น ใบเสร็จจ่ายเบี้ยประกันสังคม)
                  </li>
                </ul>
              </div>

              <p className="text-gray-600 mb-6">
                หากคุณยังไม่ได้ดำเนินการจัดทำแบบแสดงรายการภาษี กรุณาดำเนินการโดยเร็วที่สุดเพื่อหลีกเลี่ยงค่าปรับตามกฎหมาย
              </p>

              {/* CTA Button */}
              <div className="text-center">
                <a 
                  href="https://your-tax-app.com/calculator" 
                  className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  🚀 เริ่มคำนวณภาษีฟรี
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-6 text-center">
              <div className="text-xl font-bold text-green-600 mb-2">
                C-Advisor
              </div>
              <div className="text-sm text-gray-600">
                © 2026 C-Advisor. All rights reserved.<br />
                ผู้เชี่ยวชาญด้านภาษีของคุณ | ใบอนุญาติเลขที่ XX-XXXX-XXXX
              </div>
            </div>
          </div>
        </div>
      </Tailwind>
    </Html>
  );
};