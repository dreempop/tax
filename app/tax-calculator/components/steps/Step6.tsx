import React from 'react';
import { FormState, SummaryState } from '../../types/taxTypes';

interface Step6Props {
  form: FormState;
  handleChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  summary: SummaryState;
  calculateFinalTax: () => void;
  back: () => void;
  resetForm: () => void;
}

const BRACKETS = [
  { prev: 0,        limit: 150000,   rate: 0    },
  { prev: 150000,   limit: 300000,   rate: 0.05 },
  { prev: 300000,   limit: 500000,   rate: 0.10 },
  { prev: 500000,   limit: 750000,   rate: 0.15 },
  { prev: 750000,   limit: 1000000,  rate: 0.20 },
  { prev: 1000000,  limit: 2000000,  rate: 0.25 },
  { prev: 2000000,  limit: 5000000,  rate: 0.30 },
  { prev: 5000000,  limit: Infinity, rate: 0.35 },
];

function getBracketRows(netIncome: number) {
  const rows: { range: string; rateLabel: string; taxInBracket: number; cumTax: number; isLast: boolean }[] = [];
  let cumTax = 0;
  for (const { prev, limit, rate } of BRACKETS) {
    if (netIncome <= prev) break;
    const taxable = Math.min(netIncome, limit) - prev;
    const tax = Math.round(taxable * rate);
    cumTax += tax;
    const isLast = netIncome <= limit;
    const maxDisplay = isLast ? netIncome : limit;
    rows.push({
      range: `${prev.toLocaleString('th-TH')} - ${maxDisplay === Infinity ? 'ขึ้นไป' : maxDisplay.toLocaleString('th-TH')}`,
      rateLabel: rate === 0 ? 'ยกเว้น' : `${rate * 100}%`,
      taxInBracket: tax,
      cumTax,
      isLast,
    });
    if (isLast) break;
  }
  return rows;
}

const Step6: React.FC<Step6Props> = ({ form, summary, back, resetForm }) => {
  const { netIncome, taxAmount } = summary;
  const totalIncome    = (summary as any).totalIncome    ?? netIncome;
  const expenseDeduct  = (summary as any).expenseDeduction ?? 0;
  const otherDeduct    = (summary as any).otherDeductions  ?? 0;
  const rows = getBracketRows(netIncome);
  const monthlySalary  = Number(form.salary) || 0;

  const handleCopy = () => {
    const txt = [
      `รายได้ทั้งปี: ${totalIncome.toLocaleString('th-TH')} บาท`,
      `หักค่าใช้จ่าย: ${expenseDeduct.toLocaleString('th-TH')} บาท`,
      `หักลดหย่อนรวม: ${otherDeduct.toLocaleString('th-TH')} บาท`,
      `เงินได้สุทธิ: ${netIncome.toLocaleString('th-TH')} บาท`,
      `ภาษีที่ต้องจ่าย: ${taxAmount.toLocaleString('th-TH')} บาทต่อปี`,
    ].join('\n');
    navigator.clipboard?.writeText(txt).catch(() => {});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ─── Section 1: การคำนวณเงินได้สุทธิ ─────────── */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">1. การคำนวณเงินได้สุทธิ</h3>
        <p className="text-sm text-gray-500">
          ก่อนจะคำนวณภาษี เราต้องหาเงินได้สุทธิด้วยค่าใช้จ่ายและค่าลดหย่อนพื้นฐานก่อน:
        </p>
        <ul className="text-sm space-y-2">
          <li className="flex justify-between pb-2 border-b">
            <span>
              รายได้ทั้งปี:{' '}
              <span className="text-gray-400">{monthlySalary.toLocaleString('th-TH')} × 12</span>
            </span>
            <span className="font-medium">{totalIncome.toLocaleString('th-TH')} บาท</span>
          </li>
          <li className="flex justify-between pb-2 border-b">
            <span>
              หักค่าใช้จ่าย{' '}
              <span className="text-gray-400">(50% แต่ไม่เกิน 100,000 บาท)</span>
            </span>
            <span className="font-medium text-red-500">− {expenseDeduct.toLocaleString('th-TH')} บาท</span>
          </li>
          <li className="flex justify-between pb-2 border-b">
            <span>หักลดหย่อนส่วนตัว</span>
            <span className="font-medium text-red-500">− {otherDeduct.toLocaleString('th-TH')} บาท</span>
          </li>
          <li className="flex justify-between font-bold text-gray-900 pt-1">
            <span>เงินได้สุทธิเหลือ</span>
            <span>{netIncome.toLocaleString('th-TH')} บาท</span>
          </li>
        </ul>
      </div>

      {/* ─── Section 2: ตารางภาษีขั้นบันได ─────────── */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">2. ตารางคำนวณภาษีแบบขั้นบันได</h3>
        <p className="text-sm text-gray-500">
          จากเงินได้สุทธิ{' '}
          <strong className="text-gray-700">{netIncome.toLocaleString('th-TH')} บาท</strong>{' '}
          จะถูกนำมาคิดภาษีตามอัตราขั้นบรรไดภาษีดังนี้:
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">ช่วงเงินได้สุทธิ</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-600">อัตราภาษี</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">ภาษีในแต่ละขั้น</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">ภาษีสะสม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className={row.isLast ? 'bg-emerald-50' : ''}>
                  <td className="px-4 py-2">{row.range}</td>
                  <td className="px-4 py-2 text-center">{row.rateLabel}</td>
                  <td className="px-4 py-2 text-right">{row.taxInBracket.toLocaleString('th-TH')}</td>
                  <td className={`px-4 py-2 text-right ${row.isLast ? 'font-bold text-emerald-700' : ''}`}>
                    {row.cumTax.toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            📊 ส่งออกไปยังอีสิต
          </button>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            title="คัดลอก"
          >
            📋
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3 text-center text-sm text-emerald-800">
          สรุปภาษีที่ต้องจ่าย: ประมาณ{' '}
          <strong>{taxAmount.toLocaleString('th-TH')} บาทต่อปี</strong>
          {' '}(หรือเฉลี่ยเดือนละประมาณ{' '}
          <strong>{Math.round(taxAmount / 12).toLocaleString('th-TH')} บาท</strong>)
        </div>
      </div>

      {/* ─── Section 3: ตัวช่วยลดหย่อนเพิ่มเติม ─────── */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">3. ตัวช่วยลดหย่อนเพิ่มเติม</h3>
        <p className="text-sm text-gray-500">
          ตัวเลข {taxAmount.toLocaleString('th-TH')} บาทนี้คือ &quot;เพดานสูงสุด&quot; ในกรณีที่คุณไม่มีตัวช่วยลดหย่อนอื่นๆ
          เลย แต่ในความเป็นจริงคุณสามารถจ่ายภาษีน้อยลงได้หากมีรายการต่อไปนี้:
        </p>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
          <li><strong>ประกันสังคม:</strong> ลดหย่อนได้ตามจริง (สูงสุด 9,000 บาทต่อปี)</li>
          <li><strong>ค่าลดหย่อนบุตร/ดูแลบิดามารดา:</strong> (30,000 บาทต่อคน)</li>
          <li><strong>กองทุนลดหย่อนภาษี:</strong> เช่น SSF, RMF หรือ Thai ESG</li>
          <li><strong>เบี้ยประกันชีวิต/ประกันสุขภาพ:</strong> ตามที่จ่ายจริงแต่ไม่เกินที่กฎหมายกำหนด</li>
        </ul>
      </div>

      {/* ─── Buttons ──────────────────────────────────── */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          onClick={back}
          className="px-10 py-3 rounded-full border border-emerald-400 text-emerald-500 font-semibold hover:bg-emerald-50 transition-all"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={resetForm}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold hover:opacity-90 shadow-md transition-all"
        >
          เริ่มใหม่
        </button>
      </div>
    </div>
  );
};

export default Step6;
