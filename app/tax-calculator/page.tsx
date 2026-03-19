'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step3 from './components/steps/Step3';
import Step4 from './components/steps/Step4';
import Step5 from './components/steps/Step5';
import Step6 from './components/steps/Step6';
import { calculateTaxBracket } from './utils/taxCalculations';
import { formatCurrency } from './utils/formatters';
import { initialFormState } from './constants/formConstants';
import { FormState } from './types/taxTypes';

export interface SummaryState {
  netIncome: number;
  taxAmount: number;
  finalNetIncome?: number;
  finalTaxAmount?: number;
  taxSavings?: number;
  taxSavedCalc?: number;
  taxSavedMax?: number;
  remainingDeduction?: number;
  totalDeductionLimit?: number;
  deductions: {
    ssf: any;
    rmf: { max: number; used: number };
    thaiESG: { max: number; used: number };
    thaiESGX: { max: number; used: number };
    ltf: { max: number; used: number };
  };
}
export default function TaxCalculator() {
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<SummaryState>({
    netIncome: 0,
    taxAmount: 0,
    deductions: {
      rmf: { max: 500000, used: 0 },
      thaiESG: { max: 300000, used: 0 },
      thaiESGX: { max: 300000, used: 0 },
      ltf: { max: 300000, used: 0 },
      ssf: undefined,
    },
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const checkPositive = (field: string, message: string) => {
      if (form[field as keyof FormState] && Number(form[field as keyof FormState]) < 0)
        newErrors[field] = message;
    };

    if (step === 1) {
      if (!form.salary) newErrors.salary = 'กรุณากรอกเงินเดือน';
      checkPositive('salary', 'เงินเดือนต้องไม่ติดลบ');
      checkPositive('bonus', 'โบนัสต้องไม่ติดลบ');
      checkPositive('otherIncome', 'รายได้อื่นต้องไม่ติดลบ');
      if (Number(form.sso) > 9000) newErrors.sso = 'สูงสุดไม่เกิน 9,000 บาท';
      checkPositive('sso', 'ค่าประกันสังคมต้องไม่ติดลบ');
    }
    if (step === 2 && form.hasChild) {
      if (!form.child || Number(form.child) <= 0)
        newErrors.child = 'กรุณาระบุจำนวนบุตรเป็นตัวเลขจำนวนเต็มบวก';
    }
    if (step === 3) {
      const insurance = Number(form.insurance) || 0;
      const health = Number(form.healthInsurance) || 0;
      if (insurance > 100000) newErrors.insurance = 'สูงสุด 100,000 บาท';
      if (health > 25000) newErrors.healthInsurance = 'สูงสุด 25,000 บาท';
      if (insurance + health > 100000)
        newErrors.insurance = 'ประกันชีวิตและสุขภาพรวมกันต้องไม่เกิน 100,000 บาท';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => validateStep() && setStep((s) => s + 1);
  const back = () => { setErrors({}); setStep((s) => s - 1); };
  const resetForm = () => { setForm(initialFormState); setErrors({}); setStep(1); };

 const calculateTax = () => {
    const annualIncome = Number(form.salary) * 12;
    const bonus = Number(form.bonus) || 0;
    const otherIncome = Number(form.otherIncome) || 0;
    const totalIncome = annualIncome + bonus + otherIncome;

    let deductions = 60000;
    const sso = Math.min(Number(form.sso) || 0, 9000);
    deductions += sso;

    if (form.maritalStatus === 'married-joint') deductions += 60000;
    if (form.father) deductions += 30000;
    if (form.mother) deductions += 30000;
    if (form.spouseFather) deductions += 30000;
    if (form.spouseMother) deductions += 30000;

    if (form.hasChild1) {
      deductions += 30000;
      deductions += (Number(form.childPre2561) || 0) * 30000;
      deductions += (Number(form.childPost2561) || 0) * 60000;
    }

    const lifeInsurance = Math.min(Number(form.lifeInsurance) || 0, 100000);
    const healthInsurance = Math.min(Number(form.healthInsurance) || 0, 25000);
    const parentHealthInsurance = Math.min(Number(form.parentHealthInsurance) || 0, 15000);
    const combinedInsurance = Math.min(lifeInsurance + healthInsurance, 100000);
    deductions += combinedInsurance + parentHealthInsurance;

    const pensionInsurance = Math.min(Number(form.annuityInsurance) || 0, Math.min(200000, totalIncome * 0.15));
    const pvd = Math.min(Number(form.pvd) || 0, Math.min(500000, totalIncome * 0.15));
    const gpf = Math.min(Number(form.gpf) || 0, Math.min(500000, totalIncome * 0.15));
    const nsf = Math.min(Number(form.nsf) || 0, 13200);
    const teacherFund = Math.min(Number(form.privateTeacherFund) || 0, Math.min(500000, totalIncome * 0.15));
    deductions += pensionInsurance + pvd + gpf + nsf + teacherFund;

    const homeInterest = Math.min(Number(form.homeInterest) || 0, 100000);
    deductions += homeInterest;

    const donationLimit = Math.min(totalIncome * 0.1, 100000);
    const eduDonation = Math.min(Number(form.eduDonation) || 0, donationLimit);
    const genDonation = Math.min(Number(form.genDonation) || 0, donationLimit);
    const totalDonations = eduDonation * 2 + genDonation;
    deductions += totalDonations;

    const netIncome = Math.max(totalIncome - deductions, 0);
    const taxAmount = calculateTaxBracket(netIncome);

    const maxFor = (pct: number, cap: number) => Math.min(cap, totalIncome * pct);
    const totalDeductionLimit = totalIncome * 0.50;
    const usedDeductions = combinedInsurance + parentHealthInsurance + pensionInsurance +
      pvd + gpf + nsf + teacherFund + homeInterest + totalDonations;
    const remainingDeduction = Math.max(totalDeductionLimit - usedDeductions, 0);

    setSummary({
      netIncome,
      taxAmount,
      taxSavedMax: Math.min(taxAmount, remainingDeduction * 0.35),
      taxSavedCalc: 0,
      remainingDeduction,
      totalDeductionLimit,
      deductions: {
        rmf:      { max: maxFor(0.30, 500000), used: 0 },
        thaiESG:  { max: maxFor(0.30, 300000), used: 0 },
        thaiESGX: { max: maxFor(0.30, 300000), used: 0 },
        ltf:      { max: maxFor(0.30, 300000), used: 0 },
        ssf:      { max: maxFor(0.30, 300000), used: 0 },
      },
    });

    setStep(6);
  };

  const calculateFinalTax = () => {
    const rmfAmount        = Number(form.rmf) || 0;
    const thaiESGAmount    = Number(form.thaiESG) || 0;
    const thaiESGXAmount   = Number(form.thaiESGX) || 0;
    const ltfTransferAmount = Number(form.ltfTransfer) || 0;
    const ssfAmount        = Number(form.ssf) || 0;

    const checks: [number, number, string][] = [
      [rmfAmount,         summary.deductions.rmf.max,      'rmf'],
      [thaiESGAmount,     summary.deductions.thaiESG.max,  'thaiESG'],
      [thaiESGXAmount,    summary.deductions.thaiESGX.max, 'thaiESGX'],
      [ltfTransferAmount, summary.deductions.ltf.max,      'ltfTransfer'],
      [ssfAmount,         summary.deductions.ssf.max,      'ssf'],
    ];
    for (const [amount, max, key] of checks) {
      if (amount > max) {
        setErrors({ [key]: `ลงทุนได้ไม่เกิน ${formatCurrency(max)} บาท` });
        return;
      }
    }

    const specialDeductions = rmfAmount + thaiESGAmount + thaiESGXAmount + ltfTransferAmount + ssfAmount;
    const finalTaxableIncome = Math.max(summary.netIncome - specialDeductions, 0);
    const finalTaxAmount = calculateTaxBracket(finalTaxableIncome);
    const taxSavings = summary.taxAmount - finalTaxAmount;

    setSummary((prev) => ({
      ...prev,
      finalNetIncome: finalTaxableIncome,
      finalTaxAmount,
      taxSavings,
      taxSavedCalc: taxSavings,
      deductions: {
        rmf:      { ...prev.deductions.rmf,      used: rmfAmount },
        thaiESG:  { ...prev.deductions.thaiESG,  used: thaiESGAmount },
        thaiESGX: { ...prev.deductions.thaiESGX, used: thaiESGXAmount },
        ltf:      { ...prev.deductions.ltf,      used: ltfTransferAmount },
        ssf:      { ...prev.deductions.ssf,      used: ssfAmount },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-100 to-lime-100 flex justify-center items-start sm:items-center p-4 py-8">
      <motion.div
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-4xl border border-green-200"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-center text-2xl sm:text-4xl font-bold mb-2 text-green-600">
          คำนวณภาษี
        </h1>
        <p className="text-center text-gray-500 mb-6">
          ช่วยคำนวณภาษีเงินได้บุคคลธรรมดาประจำปี
        </p>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8 sm:mb-20">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                    ? "bg-green-500 text-white"
                    : "bg-green-100 text-green-600"
                  }`}
              >
                {s < 6 ? s : "✔"}
              </div>
              {s < 6 && (
                <div
                  className={`w-6 sm:w-12 md:w-20 h-[3px] transition-colors ${step > s ? "bg-green-400" : "bg-green-200"
                    }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            {/* === STEP 1 === */}
            {step === 1 && (
              <Step1 
                form={form} 
                handleChange={handleChange} 
                errors={errors}
                next={next}
              />
            )}
            {/* === STEP 2 === */}
            {step === 2 && (
              <Step2 
                form={form} 
                handleChange={handleChange} 
                errors={errors}
                next={next}
                back={back}
              />
            )}
            {/* === STEP 3 === */}
            {step === 3 && (
              <Step3 
                form={form} 
                handleChange={handleChange} 
                errors={errors}
                next={next}
                back={back}
              />
            )}
            {/* === STEP 4 === */}
            {step === 4 && (
              <Step4 
                form={form} 
                handleChange={handleChange} 
                errors={errors}
                next={next}
                back={back}
              />
            )}
            {/* === STEP 5 === */}
            {step === 5 && (
              <Step5 
                form={form}
                handleChange={handleChange} 
                errors={errors}
                calculateTax={calculateTax}
                back={back}
              />
            )}
            {/* === STEP 6 === */}
            {step === 6 && (
              <Step6 
                form={form} 
                handleChange={handleChange} 
                errors={errors}
                summary={summary}
                calculateFinalTax={calculateFinalTax}
                back={back}
                resetForm={resetForm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
