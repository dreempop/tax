// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // เพิ่มสีที่ใช้ในรูปภาพ
      colors: {
        'custom-blue': '#2563EB', // สีน้ำเงินปุ่ม
        'custom-green': '#10B981', // สีเขียวพื้นหลัง
        'custom-green-dark': '#059669', // สีเขียวเข้มบนการ์ด
        'custom-light-blue': '#E0F2FE', // สีฟ้าอ่อนพื้นหลัง
        'custom-gray-text': '#6B7280', // สีเทาข้อความ
      },
      // เพิ่มขนาดฟอนต์ให้ตรงกับรูป
      fontSize: {
        'title-hero': '3rem', // ขนาดหัวข้อใหญ่
        'title-card': '1.5rem', // ขนาดหัวข้อการ์ด
      },
      fontFamily: {
        'thai': ['Sukhumvit Set', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config