import React from 'react';
import { FormState } from '../../types/taxTypes';
import { Input, Label, ErrorMessage, NextButton } from '../ui/TaxUIComponents';

interface Step1Props {
  form: FormState;
  handleChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  next: () => void;
}

const Step1: React.FC<Step1Props> = ({ form, handleChange, errors, next }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        ข้อมูลรายได้
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label text="เงินเดือนต่อเดือน" />
          <Input
            placeholder="ระบุเงินเดือนต่อเดือน"
            value={form.salary}
            onChange={(e: { target: { value: any; }; }) => handleChange("salary", e.target.value)}
            error={errors.salary}
          />
          <ErrorMessage message={errors.salary} />
        </div>

        <div>
          <Label text="โบนัส" />
          <Input
            placeholder="ระบุโบนัส (ถ้ามี)"
            value={form.bonus}
            onChange={(e: { target: { value: any; }; }) => handleChange("bonus", e.target.value)}
            error={errors.bonus}
          />
          <ErrorMessage message={errors.bonus} />
        </div>

        <div>
          <Label text="รายได้อื่นๆ" />
          <Input
            placeholder="ระบุรายได้อื่นๆ (ถ้ามี)"
            value={form.otherIncome}
            onChange={(e: { target: { value: any; }; }) => handleChange("otherIncome", e.target.value)}
            error={errors.otherIncome}
          />
          <ErrorMessage message={errors.otherIncome} />
        </div>

        <div>
          <Label text="ค่าประกันสังคมต่อเดือน" />
          <Input
            placeholder="ระบุค่าประกันสังคม (สูงสุด 9,000 บาท)"
            value={form.sso}
            onChange={(e: { target: { value: any; }; }) => handleChange("sso", e.target.value)}
            error={errors.sso}
          />
          <ErrorMessage message={errors.sso} />
          <p className="text-sm text-gray-500 mt-1">
            หัก 5% ของเงินเดือน สูงสุด 750 บาทต่อเดือน (9,000 บาทต่อปี)
          </p>
        </div>
      </div>

      <NextButton onClick={next} />
    </div>
  );
};

export default Step1;