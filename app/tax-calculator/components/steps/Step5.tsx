"use client";

import React from "react";
import { StepProps } from "./Step3";


const Step5OtherFunds: React.FC<StepProps> = ({
  form,
  errors,
  handleChange,
  back,
  calculateTax,
}) => {
  const toNumber = (value: string): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        รายการลดหย่อนภาษี : กองทุนอื่นๆ
      </h2>

      <div className="space-y-6">
        {/* กบข. */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            กองทุนบำเหน็จบำนาญข้าราชการ (กบข.)
          </label>
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
              errors?.gpf
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-emerald-400"
            } text-gray-700`}
            value={form.gpf ?? ""}
            onChange={(e) => handleChange("gpf", toNumber(e.target.value))}
          />
          {errors?.gpf && (
            <p className="text-sm text-red-500 mt-1">{errors.gpf}</p>
          )}
          <p className="text-sm text-emerald-700 mt-1">
            ไม่เกิน 15% ของรายได้ทั้งปี และรวมกับกองทุนอื่นไม่เกิน 500,000 บาท
          </p>
        </div>

        {/* กอช. */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            กองทุนออมแห่งชาติ (กอช.)
          </label>
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
              errors?.nsf
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-emerald-400"
            } text-gray-700`}
            value={form.nsf ?? ""}
            onChange={(e) => handleChange("nsf", toNumber(e.target.value))}
          />
          {errors?.nsf && (
            <p className="text-sm text-red-500 mt-1">{errors.nsf}</p>
          )}
          <p className="text-sm text-emerald-700 mt-1">
            ไม่เกิน 13,200 บาท และรวมกับกองทุนอื่นและเบี้ยประกันชีวิตแบบบำนาญแล้วไม่เกิน
            500,000 บาท
          </p>
        </div>

        {/* กองทุนครูเอกชน */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            กองทุนครูเอกชน
          </label>
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="ระบุจำนวนเงิน"
            min="0"
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
              errors?.privateTeacherFund
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-emerald-400"
            } text-gray-700`}
            value={form.privateTeacherFund ?? ""}
            onChange={(e) =>
              handleChange("privateTeacherFund", toNumber(e.target.value))
            }
          />
          {errors?.privateTeacherFund && (
            <p className="text-sm text-red-500 mt-1">
              {errors.privateTeacherFund}
            </p>
          )}
          <p className="text-sm text-emerald-700 mt-1">
            ไม่เกิน 15% ของรายได้ทั้งปี และรวมกับกองทุนอื่นและเบี้ยประกันชีวิตแบบบำนาญแล้วไม่เกิน
            500,000 บาท
          </p>
        </div>
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-center gap-6 mt-12">
        <button
          onClick={back}
          className="px-10 py-3 rounded-full border border-emerald-400 text-emerald-500 font-semibold hover:bg-emerald-50 transition-all"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={() => calculateTax?.()}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold hover:opacity-90 shadow-md transition-all"
        >
          คำนวณภาษี
        </button>
      </div>
    </div>
  );
};

export default Step5OtherFunds;
