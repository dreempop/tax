import { TAX_BRACKETS, DEDUCTION_LIMITS } from '../constants/formConstants';

export const calculateTaxBracket = (income: number): number => {
  let tax = 0;
  let remaining = income;
  let prevLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    const taxableInBracket = Math.min(remaining, bracket.limit - prevLimit);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevLimit = bracket.limit;
    if (remaining <= 0) break;
  }

  return tax;
};

export const calculateDeductions = (form: any, annualIncome: number): number => {
  let deductions = DEDUCTION_LIMITS.PERSONAL; // Personal allowance
  
  // SSO deduction
  const sso = Math.min(Number(form.sso) || 0, DEDUCTION_LIMITS.SSO);
  deductions += sso;

  // Spouse deduction
  if (form.maritalStatus === 'married-joint') {
    deductions += DEDUCTION_LIMITS.SPOUSE;
  }

  // Parent deductions
  if (form.father) deductions += DEDUCTION_LIMITS.PARENT;
  if (form.mother) deductions += DEDUCTION_LIMITS.PARENT;
  if (form.spouseFather) deductions += DEDUCTION_LIMITS.PARENT;
  if (form.spouseMother) deductions += DEDUCTION_LIMITS.PARENT;

  // Child deductions
  if (form.hasChild1) {
    deductions += DEDUCTION_LIMITS.CHILD_FIRST;
    deductions += (Number(form.childPre2561) || 0) * DEDUCTION_LIMITS.CHILD_PRE2561;
    deductions += (Number(form.childPost2561) || 0) * DEDUCTION_LIMITS.CHILD_POST2561;
  }

  // Insurance deductions
  const lifeInsurance = Number(form.lifeInsurance) || 0;
  const healthInsurance = Number(form.healthInsurance) || 0;
  const combinedInsurance = Math.min(lifeInsurance + healthInsurance, DEDUCTION_LIMITS.INSURANCE_LIFE);
  deductions += combinedInsurance;

  // Parent health insurance
  const parentHealthInsurance = Math.min(Number(form.parentHealthInsurance) || 0, DEDUCTION_LIMITS.INSURANCE_PARENT);
  deductions += parentHealthInsurance;

  // Pension insurance
  const pensionInsurance = Math.min(Number(form.annuityInsurance) || 0, DEDUCTION_LIMITS.INSURANCE_ANNUITY);
  deductions += pensionInsurance;

  // Fund deductions
  const pvd = Math.min(Number(form.pvd) || 0, annualIncome * DEDUCTION_LIMITS.PVD_MAX_PERCENT);
  const gpf = Math.min(Number(form.gpf) || 0, annualIncome * DEDUCTION_LIMITS.GPF_MAX_PERCENT);
  const nsf = Math.min(Number(form.nsf) || 0, DEDUCTION_LIMITS.NSF_MAX);
  const teacherFund = Math.min(Number(form.privateTeacherFund) || 0, annualIncome * DEDUCTION_LIMITS.GPF_MAX_PERCENT);

  deductions += pvd + gpf + nsf + teacherFund;

  // Home interest deduction
  const homeInterest = Math.min(Number(form.homeInterest) || 0, DEDUCTION_LIMITS.HOME_INTEREST);
  deductions += homeInterest;

  return deductions;
};

export const calculateInvestmentLimits = (netIncome: number) => {
  return {
    rmf: Math.min(DEDUCTION_LIMITS.RMF_MAX, netIncome * DEDUCTION_LIMITS.RMF_MAX_PERCENT),
    thaiESG: Math.min(DEDUCTION_LIMITS.THAIESG_MAX, netIncome * DEDUCTION_LIMITS.THAIESG_MAX_PERCENT),
    thaiESGX: Math.min(DEDUCTION_LIMITS.THAIESG_MAX, netIncome * DEDUCTION_LIMITS.THAIESG_MAX_PERCENT),
    ltf: Math.min(DEDUCTION_LIMITS.LTF_MAX, netIncome * DEDUCTION_LIMITS.LTF_MAX_PERCENT),
  };
};

export const calculateDonationTaxSavings = (form: any, netIncome: number) => {
  const donationLimit = netIncome * DEDUCTION_LIMITS.DONATION_PERCENT;
  const eduDonation = Math.min(Number(form.eduDonation) || 0, donationLimit);
  const genDonation = Math.min(Number(form.genDonation) || 0, donationLimit);
  
  const eduDonationTaxSaving = eduDonation * 2; // Double deduction for education donations
  const genDonationTaxSaving = genDonation;
  
  return {
    eduDonation,
    genDonation,
    totalDonations: eduDonation + genDonation,
    taxSavings: eduDonationTaxSaving + genDonationTaxSaving
  };
};