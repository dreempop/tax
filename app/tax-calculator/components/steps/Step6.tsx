import React, { useState } from 'react';
import { FormState, SummaryState } from '../../types/taxTypes';
import { formatCurrency } from '../../utils/formatters';
import { ResultRow } from '../ui/TaxUIComponents';

interface Step6Props {
  form: FormState;
  handleChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  summary: SummaryState;
  calculateFinalTax: () => void;
  back: () => void;
  resetForm: () => void;
}

// Function to determine tax bracket
const getTaxBracket = (income: number): { bracket: string; rate: string; range: string } => {
  if (income <= 150000) {
    return { 
      bracket: "ขั้นที่ 1", 
      rate: "0%", 
      range: "0 - 150,000 บาท" 
    };
  } else if (income <= 300000) {
    return { 
      bracket: "ขั้นที่ 2", 
      rate: "5%", 
      range: "150,001 - 300,000 บาท" 
    };
  } else if (income <= 500000) {
    return { 
      bracket: "ขั้นที่ 3", 
      rate: "10%", 
      range: "300,001 - 500,000 บาท" 
    };
  } else if (income <= 1000000) {
    return { 
      bracket: "ขั้นที่ 4", 
      rate: "15%", 
      range: "500,001 - 1,000,000 บาท" 
    };
  } else if (income <= 2000000) {
    return { 
      bracket: "ขั้นที่ 5", 
      rate: "20%", 
      range: "1,000,001 - 2,000,000 บาท" 
    };
  } else if (income <= 5000000) {
    return { 
      bracket: "ขั้นที่ 6", 
      rate: "25%", 
      range: "2,000,001 - 5,000,000 บาท" 
    };
  } else if (income <= 10000000) {
    return { 
      bracket: "ขั้นที่ 7", 
      rate: "30%", 
      range: "5,000,001 - 10,000,000 บาท" 
    };
  } else if (income <= 20000000) {
    return { 
      bracket: "ขั้นที่ 8", 
      rate: "35%", 
      range: "10,000,001 - 20,000,000 บาท" 
    };
  } else {
    return { 
      bracket: "ขั้นที่ 9", 
      rate: "35%", 
      range: "เกิน 20,000,000 บาท" 
    };
  }
};

const Step6: React.FC<Step6Props> = ({ 
  form, 
  handleChange, 
  errors, 
  summary, 
  calculateFinalTax, 
  back, 
  resetForm 
}) => {
  const [showFinalResults, setShowFinalResults] = useState(false);
  
  // Get tax bracket information
  const taxBracketInfo = getTaxBracket(summary.netIncome);

  // Handle final tax calculation
  const handleCalculateFinalTax = () => {
    calculateFinalTax();
    setShowFinalResults(true);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/70 p-4 sm:p-8 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-4">
        คำนวณภาษี
      </h2>

      {/* 1. Summary section */}
      <div className="space-y-2 border-b pb-4">
        <ResultRow label="รวมเงินได้สุทธิ" value={summary.netIncome} isBold />
        <ResultRow label="ภาษีที่ต้องจ่าย" value={summary.taxAmount} isBold isRed />
      </div>

      {/* 2. Tax bracket information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-3">ขั้นบรรไดภาษี</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">ขั้นบรรได:</span>
            <span className="font-bold">{taxBracketInfo.bracket}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">อัตราภาษี:</span>
            <span className="font-bold">{taxBracketInfo.rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">ช่วงรายได้:</span>
            <span className="font-bold">{taxBracketInfo.range}</span>
          </div>
        </div>
      </div>

      {/* 3. Tax bracket table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">ตารางขั้นบรรไดภาษี</h3>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ขั้นที่</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">อัตราภาษี</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ช่วงรายได้ (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className={summary.netIncome <= 150000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 1</td>
              <td className="px-4 py-2 text-sm">0%</td>
              <td className="px-4 py-2 text-sm">0 - 150,000</td>
            </tr>
            <tr className={summary.netIncome > 150000 && summary.netIncome <= 300000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 2</td>
              <td className="px-4 py-2 text-sm">5%</td>
              <td className="px-4 py-2 text-sm">150,001 - 300,000</td>
            </tr>
            <tr className={summary.netIncome > 300000 && summary.netIncome <= 500000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 3</td>
              <td className="px-4 py-2 text-sm">10%</td>
              <td className="px-4 py-2 text-sm">300,001 - 500,000</td>
            </tr>
            <tr className={summary.netIncome > 500000 && summary.netIncome <= 1000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 4</td>
              <td className="px-4 py-2 text-sm">15%</td>
              <td className="px-4 py-2 text-sm">500,001 - 1,000,000</td>
            </tr>
            <tr className={summary.netIncome > 1000000 && summary.netIncome <= 2000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 5</td>
              <td className="px-4 py-2 text-sm">20%</td>
              <td className="px-4 py-2 text-sm">1,000,001 - 2,000,000</td>
            </tr>
            <tr className={summary.netIncome > 2000000 && summary.netIncome <= 5000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 6</td>
              <td className="px-4 py-2 text-sm">25%</td>
              <td className="px-4 py-2 text-sm">2,000,001 - 5,000,000</td>
            </tr>
            <tr className={summary.netIncome > 5000000 && summary.netIncome <= 10000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 7</td>
              <td className="px-4 py-2 text-sm">30%</td>
              <td className="px-4 py-2 text-sm">5,000,001 - 10,000,000</td>
            </tr>
            <tr className={summary.netIncome > 10000000 && summary.netIncome <= 20000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 8</td>
              <td className="px-4 py-2 text-sm">35%</td>
              <td className="px-4 py-2 text-sm">10,000,001 - 20,000,000</td>
            </tr>
            <tr className={summary.netIncome > 20000000 ? "bg-green-100" : ""}>
              <td className="px-4 py-2 text-sm">ขั้นที่ 9</td>
              <td className="px-4 py-2 text-sm">35%</td>
              <td className="px-4 py-2 text-sm">เกิน 20,000,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Navigation buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={back}
          className="px-8 py-3 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={resetForm}
          className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
        >
          เริ่มใหม่
        </button>
      </div>
    </div>
  );
};

export default Step6;