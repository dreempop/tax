export interface Deduction {
  max: number;
  used: number;
}

// รวมและปรับปรุงประเภทข้อมูล FormState ให้ครบถ้วนและไม่ซ้ำซ้อน
export interface FormState {
  // รายได้
  salary: string;
  bonus: string;
  otherIncome: string;
  sso: string;
  socialSecurity?: string; // ใช้แทน sso ในบางกรณี
  
  // สถานภาพสมรสและบุตร
  maritalStatus: string;
  spouse: boolean; // เพิ่มจาก interface แรก
  hasChild: boolean;
  hasChild1: boolean;
  child: string; // ใช้ string เพื่อความสอดคล้องกับ input fields
  childPre2561: string;
  childPost2561: string;
  
  // บิดามารดา
  father: boolean;
  mother: boolean;
  spouseFather: boolean;
  spouseMother: boolean;
  
  // คนพิการ
  disabledFather?: boolean;
  disabledMother?: boolean;
  disabledChild?: boolean;
  disabledRelative?: boolean;
  disabledSpouse?: boolean;
  disabledSpouseFather?: boolean;
  disabledSpouseMother?: boolean;
  
  // ประกัน
  insurance: string; // จาก interface แรก
  lifeInsurance: string;
  healthInsurance: string;
  parentHealthInsurance: string;
  annuityInsurance: string;
  
  // กองทุน
  pvd: string;
  gpf: string;
  nsf: string;
  privateTeacherFund: string;
  
  // ที่อยู่อาศัย
  homeInterest: string;
  
  // บริจาค
  eduDonation: string;
  genDonation: string;
  
  // การลงทุนพิเศษ
  ssf: string;
  rmf: string;
  thaiESG: string;
  thaiESGX: string;
  ltfTransfer: string;
}

// อัปเดตประเภทข้อมูล SummaryState ให้ครบถ้วนและใช้ Deduction interface
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
    rmf: Deduction;
    thaiESG: Deduction;
    thaiESGX: Deduction;
    ltf: Deduction;
    ssf: Deduction;
  };
}

// ประเภทข้อมูลสำหรับ UI Components
export interface InputProps {
  placeholder?: string;
  error?: string;
  [key: string]: any;
}

export interface LabelProps {
  text: string;
}

export interface ErrorMessageProps {
  message?: string;
}

export interface RadioOption {
  label: string;
  value: string | boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  selected: string | boolean;
  onChange: (value: string | boolean) => void;
}

export interface NextButtonProps {
  onClick: () => void;
}

export interface NavButtonsProps {
  back?: () => void;
  next?: () => void;
  onNext?: () => void;
  label?: string;
}

export interface ResultRowProps {
  label: string;
  value: number;
  isBold?: boolean;
  isRed?: boolean;
}

export interface InputRowProps {
  label: string;
  description: string;
  subDescription?: string;
  maxAmount: number;
  name: string;
  value: string | undefined;
  onChange: (name: string, value: any) => void;
  placeholder?: string;
}

export interface TwoColResultRowProps {
  label: string;
  maxValue: number;
  calcValue: number;
}