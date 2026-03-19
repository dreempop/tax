'use client';
import React from 'react';


import { FormState } from '../../types/taxTypes';
import { ErrorMessage, Input, Label, NavButtons } from '../ui/TaxUIComponents';

interface Step4Props {
  form: FormState;
  handleChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  next: () => void;
  back: () => void;
}

const Step4: React.FC<Step4Props> = ({ form, handleChange, errors, next, back }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        รายการลดหย่อนภาษี : ประกัน
      </h2>

      {/* === กล่องฟอร์มหลัก === */}
      <div className="space-y-6">

        {/* --- แถวที่ 1 --- */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 1.1 เบี้ยประกันชีวิต */}
          <div>
            <Label text="เบี้ยประกันชีวิต" />
            <Input
              type="number"
              placeholder="ระบุจำนวนเงิน"
              min="0"
              value={form.lifeInsurance || ''}
              onChange={(e: { target: { value: string; }; }) => handleChange('lifeInsurance', parseInt(e.target.value) || 0)}
              error={errors.lifeInsurance}
            />
            <ErrorMessage message={errors.lifeInsurance} />
            <p className="text-sm text-emerald-700 mt-1">ไม่เกิน 100,000 บาท</p>
          </div>

          {/* 1.2 เบี้ยประกันสุขภาพ */}
          <div>
            <Label text="เบี้ยประกันสุขภาพ" />
            <Input
              type="number"
              placeholder="ระบุจำนวนเงิน"
              min="0"
              value={form.healthInsurance || ''}
              onChange={(e: { target: { value: string; }; }) => handleChange('healthInsurance', parseInt(e.target.value) || 0)}
              error={errors.healthInsurance}
            />
            <ErrorMessage message={errors.healthInsurance} />
            <p className="text-sm text-emerald-700 mt-1">ไม่เกิน 25,000 บาท</p>
          </div>
        </div>

        {/* คำอธิบายรวม */}
        <p className="text-sm text-emerald-700 -mt-4">
          เบี้ยประกันชีวิต และ ประกันสุขภาพรวมกันต้องไม่เกิน 100,000 บาท
        </p>

        <hr className="border-gray-200" />

        {/* --- แถวที่ 2 --- */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 2.1 เบี้ยประกันสุขภาพบิดา มารดา */}
          <div>
            <Label text="เบี้ยประกันสุขภาพบิดา มารดา" />
            <Input
              type="number"
              placeholder="ระบุจำนวนเงิน"
              min="0"
              value={form.parentHealthInsurance || ''}
              onChange={(e: { target: { value: string; }; }) => handleChange('parentHealthInsurance', parseInt(e.target.value) || 0)}
              error={errors.parentHealthInsurance}
            />
            <ErrorMessage message={errors.parentHealthInsurance} />
            <p className="text-sm text-emerald-700 mt-1">ไม่เกิน 15,000 บาท</p>
          </div>

          {/* 2.2 เบี้ยประกันชีวิตบำนาญ */}
          <div>
            <Label text="เบี้ยประกันชีวิตบำนาญ" />
            <Input
              type="number"
              placeholder="ระบุจำนวนเงิน"
              min="0"
              value={form.annuityInsurance || ''}
              onChange={(e: { target: { value: string; }; }) => handleChange('annuityInsurance', parseInt(e.target.value) || 0)}
              error={errors.annuityInsurance}
            />
            <ErrorMessage message={errors.annuityInsurance} />
            <p className="text-sm text-emerald-700 mt-1">
              ไม่เกิน 15% ของรายได้ทั้งปี ไม่เกิน 200,000 บาท หากไม่ใช้สิทธิ สามารถรวมเงินออมได้สูงสุด 300,000 บาท และรวมกับกองทุนอื่นไม่เกิน 500,000 บาท
            </p>
          </div>
        </div>
      </div>

      {/* --- ปุ่มย้อนกลับ / ถัดไป --- */}
      <div className="flex justify-center gap-6 mt-12">
        <NavButtons back={back} next={next} />
      </div>
    </div>
  );
};

export default Step4;
