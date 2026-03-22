"use client";

import React from "react";

interface Step2FamilyDeductionProps {
  form: any;
  handleChange: (field: string, value: any) => void;
  errors?: any;
  back: () => void;
  next: () => void;
}

const Step2FamilyDeduction: React.FC<Step2FamilyDeductionProps> = ({
  form,
  handleChange,
  errors,
  back,
  next,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        รายการลดหย่อนภาษี : ครอบครัว
      </h2>

      {/* --- ส่วนบน (สถานะสมรส / ลดหย่อนส่วนบุคคล) --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* สถานะสมรส */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            สถานะสมรส
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
            value={form.maritalStatus || "single"}
            onChange={(e) => handleChange("maritalStatus", e.target.value)}
          >
            <option value="single">โสด</option>
            <option value="divorced">หย่า</option>
            <option value="married-separate">คู่สมรสมีเงินได้ (แยกยื่น)</option>
            <option value="married-joint">คู่สมรสไม่มีเงินได้</option>
          </select>
        </div>

        {/* ลดหย่อนส่วนบุคคล */}
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            ลดหย่อนส่วนบุคคล
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-200 text-gray-600 cursor-not-allowed"
            value="60,000"
            disabled
          />
        </div>
      </div>

      {/* === ลดหย่อนคู่สมรส (เฉพาะสถานะที่มีคู่สมรส) === */}
      {form.maritalStatus === "married-separate" && (
        <p className="text-sm text-emerald-700 mt-3">
          ลดหย่อนคู่สมรสที่ไม่มีเงินได้ 60,000 บาท
        </p>
      )}
      {form.maritalStatus === "married-joint" && (
        <p className="text-sm text-emerald-700 mt-3">
          ลดหย่อนคู่สมรสไม่มีรายได้ 60,000 บาท
        </p>
      )}

      {/* ================================================================
          ส่วนลดหย่อนเพิ่มเติม (บิดา มารดา บุตร ผู้พิการ)
      ================================================================ */}
      <div className="mt-8 space-y-8">
        {/* === 1. บิดา มารดา === */}
        <div>
          <div
            className={`grid ${
              form.maritalStatus === "married-separate" ||
              form.maritalStatus === "married-joint"
                ? "md:grid-cols-2"
                : "md:grid-cols-1"
            } gap-6`}
          >
            {/* ตนเอง */}
            <div>
              <p className="font-semibold text-gray-800 mb-2">
                ลดหย่อนบิดา-มารดา (ตนเอง)
              </p>
              <div className="flex gap-6 mb-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.father || false}
                    onChange={(e) => handleChange("father", e.target.checked)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span>บิดา</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.mother || false}
                    onChange={(e) => handleChange("mother", e.target.checked)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span>มารดา</span>
                </label>
              </div>
            </div>

            {/* คู่สมรส */}
            {(form.maritalStatus === "married-separate" ||
              form.maritalStatus === "married-joint") && (
              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  ลดหย่อนบิดา-มารดา (คู่สมรส)
                </p>
                <div className="flex gap-6 mb-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.spouseFather || false}
                      onChange={(e) =>
                        handleChange("spouseFather", e.target.checked)
                      }
                      className="w-5 h-5 accent-emerald-500"
                    />
                    <span>บิดา</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.spouseMother || false}
                      onChange={(e) =>
                        handleChange("spouseMother", e.target.checked)
                      }
                      className="w-5 h-5 accent-emerald-500"
                    />
                    <span>มารดา</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-emerald-700 mt-2">
            คนละ 30,000 บาท (บิดามารดาต้องมีอายุเกิน 60 ปี และมีเงินได้ไม่เกิน 30,000 บาทต่อปี) (ได้ทั้งบิดา มารดาของตนเอง และคู่สมรส)
          </p>
        </div>

        {/* === 2. บุตร === */}
        {(form.maritalStatus === "divorced" ||
          form.maritalStatus === "married-separate" ||
          form.maritalStatus === "married-joint") && (
          <>
            {/* บุตรคนที่ 1 */}
            <div>
              <p className="font-semibold text-gray-800 mb-2">
                บุตรคนที่ 1 (เกิดปีใดก็ตาม)
              </p>
              <div className="flex gap-6 mb-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasChild1"
                    checked={form.hasChild1 === true}
                    onChange={() => handleChange("hasChild1", true)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span>มี</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasChild1"
                    checked={!form.hasChild1}
                    onChange={() => handleChange("hasChild1", false)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span>ไม่มี</span>
                </label>
              </div>
              <p className="text-sm text-emerald-700">ลดหย่อน 30,000 บาท</p>
            </div>

            {/* บุตรคนที่ 2+ */}
            {form.hasChild1 && (
              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  บุตรคนที่ 2 เป็นต้นไป
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนบุตรที่เกิดก่อนปี 2561
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="จำนวนคน"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
                      value={form.childPre2561 || ""}
                      onChange={(e) =>
                        handleChange(
                          "childPre2561",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-sm text-emerald-700 mt-1">
                      ลดหย่อนคนละ 30,000 บาท
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนบุตรที่เกิดตั้งแต่ปี 2561 เป็นต้นไป
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="จำนวนคน"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700"
                      value={form.childPost2561 || ""}
                      onChange={(e) =>
                        handleChange(
                          "childPost2561",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-sm text-emerald-700 mt-1">
                      ลดหย่อนคนละ 60,000 บาท
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* === 3. ผู้พิการ === */}
        <div>
          <p className="font-semibold text-gray-800 mb-2">
            ลดหย่อนผู้พิการหรือทุพพลภาพ (ไม่มีเงินได้)
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-1">
            {[
              ["disabledFather", "บิดา"],
              ["disabledMother", "มารดา"],
              ["disabledRelative", "ญาติ (เช่น พี่,น้อง ฯลฯ)"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key] || false}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {(form.maritalStatus === "divorced" ||
            form.maritalStatus === "married-separate" ||
            form.maritalStatus === "married-joint") &&
            form.hasChild1 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.disabledChild || false}
                  onChange={(e) => handleChange("disabledChild", e.target.checked)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span>บุตร</span>
              </label>
            )}
          {(form.maritalStatus === "divorced" ||
            form.maritalStatus === "married-separate" ||
            form.maritalStatus === "married-joint") && (
            <p className="text-sm text-emerald-700 mt-2">
              กรณีบิดา, มารดา, คู่สมรส, บิดาคู่สมรส , มารดาคู่สมรส และบุตรของตนเอง<br />
              หากเป็นผู้ดูแลเพียง 1 คนนั้น ลดหย่อนได้คนละ 60,000 บาท (ต้องมีบัตรประจำตัวคนพิการ และไม่มีรายได้)
            </p>
          )}
        </div>

        {/* คู่สมรสผู้พิการ */}
        {(form.maritalStatus === "married-separate" ||
          form.maritalStatus === "married-joint") && (
          <div>
            <p className="font-semibold text-gray-800 mb-2">
              ลดหย่อนผู้พิการหรือทุพพลภาพ (คู่สมรสไม่มีเงินได้)
            </p>
            {[
              ["disabledSpouse", "คู่สมรส"],
              ["disabledSpouseFather", "บิดา"],
              ["disabledSpouseMother", "มารดา"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key] || false}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span>{label}</span>
              </label>
            ))}
            <p className="text-sm text-emerald-700 mt-2">
              กรณีบิดา, มารดา, คู่สมรส, บิดาคู่สมรส , มารดาคู่สมรส และบุตรของตนเอง<br />
              หากเป็นผู้ดูแลเพียง 1 คนนั้น ลดหย่อนได้คนละ 60,000 บาท (ต้องมีบัตรประจำตัวคนพิการ และไม่มีรายได้)
            </p>
          </div>
        )}
      </div>

      {/* --- ปุ่มย้อนกลับ / ถัดไป --- */}
      <div className="flex justify-center gap-6 mt-12">
        <button
          onClick={back}
          className="px-10 py-3 rounded-full border border-emerald-400 text-emerald-500 font-semibold hover:bg-emerald-50 transition-all"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={next}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold hover:opacity-90 shadow-md transition-all"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Step2FamilyDeduction;
