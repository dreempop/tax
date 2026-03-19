import React from "react";
import { FormState } from "../../types/taxTypes";
import { NavButtons } from "../ui/TaxUIComponents";



export interface StepProps {
  form: FormState;
  handleChange: (field: string, value: any) => void;
  back?: () => void;
  next?: () => void;
  errors?: Record<string, string>;
  calculateTax?: () => void;
}

const Step3: React.FC<StepProps> = ({ form, handleChange, back, next, errors }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        รายการลดหย่อนภาษี : กองทุน เงินประกันสังคม และที่อยู่อาศัย
      </h2>

      <div className="space-y-6">
        {/* 1. ค่าลดหย่อนกองทุนสำรองเลี้ยงชีพ (PVD) */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            ค่าลดหย่อนกองทุนสำรองเลี้ยงชีพ (PVD)
          </label>
          <input
            type="number"
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
            value={form.pvd || ""}
            onChange={(e) =>
              handleChange("pvd", e.target.value ? parseInt(e.target.value) : 0)
            }
          />
          {errors?.pvd && <p className="text-red-500 text-sm mt-1">{errors.pvd}</p>}
          <p className="text-sm text-emerald-700 mt-1">
            ไม่เกิน 15% ของเงินเดือน (ไม่รวมเงินสมทบจากนายจ้าง) และไม่เกิน
            500,000 บาท
          </p>
        </div>

        {/* 2. เงินประกันสังคม */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            เงินประกันสังคม
          </label>
          <input
            type="number"
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
            value={form.sso || ""}
            onChange={(e) =>
              handleChange(
                "sso",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
          />
          {errors?.sso && <p className="text-red-500 text-sm mt-1">{errors.sso}</p>}
          <p className="text-sm text-emerald-700 mt-1">ไม่เกิน 9,000 บาท</p>
        </div>

        {/* 3. ดอกเบี้ยที่อยู่อาศัย */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            ดอกเบี้ยที่อยู่อาศัย
          </label>
          <input
            type="number"
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
            value={form.homeInterest || ""}
            onChange={(e) =>
              handleChange(
                "homeInterest",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
          />
          {errors?.homeInterest && (
            <p className="text-red-500 text-sm mt-1">{errors.homeInterest}</p>
          )}
          <p className="text-sm text-emerald-700 mt-1">ไม่เกิน 100,000 บาท</p>
        </div>
      </div>

      {/* ปุ่มย้อนกลับ / ถัดไป */}
      <div className="mt-12">
        <NavButtons back={back} next={next} />
      </div>
    </div>
  );
};

export default Step3;
