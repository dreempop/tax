import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  InputProps,
  LabelProps,
  ErrorMessageProps,
  RadioGroupProps,
  NextButtonProps,
  NavButtonsProps,
  ResultRowProps,
  InputRowProps,
  TwoColResultRowProps
} from '../../types/taxTypes';

export const Input: React.FC<InputProps> = ({ placeholder, error, ...props }) => (
  <input
    type="number"
    className={`w-full border rounded-lg p-2 mt-1 mb-2 focus:outline-none ${error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-green-300"
      }`}
    placeholder={placeholder}
    {...props}
  />
);

export const Label: React.FC<LabelProps> = ({ text }) => (
  <label className="font-medium text-gray-700 mt-3 block">{text}</label>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-sm text-red-600 mb-2"
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, name, selected, onChange }) => (
  <div className="flex flex-col gap-2 mt-2 mb-2">
    {options.map((opt) => (
      <label
        key={opt.label}
        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors"
      >
        <input
          type="radio"
          name={name}
          checked={selected === opt.value}
          onChange={() => onChange(opt.value)}
          className="w-4 h-4 accent-green-500"
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);

export const NextButton: React.FC<NextButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-green-500 text-white font-bold py-2.5 rounded-lg mt-5 hover:bg-green-600 transition-all"
  >
    ถัดไป
  </button>
);

export const NavButtons: React.FC<NavButtonsProps> = ({ back, next, onNext, label = "ถัดไป" }) => (
  <div className="flex justify-between mt-5">
    <button
      className="bg-green-100 text-green-700 font-bold py-2.5 px-6 rounded-lg hover:bg-green-200 transition-all"
      onClick={back}
    >
      ย้อนกลับ
    </button>
    <button
      className="bg-green-500 text-white font-bold py-2.5 px-7 rounded-lg hover:bg-green-600 transition-all"
      onClick={onNext || next}
    >
      {label}
    </button>
  </div>
);

export const ResultRow: React.FC<ResultRowProps> = ({ label, value, isBold, isRed }) => (
  <div className={`flex justify-between py-1 ${isBold ? 'font-semibold' : ''} ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
    <span>{label}</span>
    <span className={isBold ? 'text-xl' : ''}>
      {value.toLocaleString()} <span className="text-sm font-normal">บาท</span>
    </span>
  </div>
);

export const InputRow: React.FC<InputRowProps> = ({
  label,
  description,
  subDescription,
  maxAmount,
  name,
  value,
  onChange,
  placeholder = "ระบุจำนวนเงิน"
}) => {
  const internalChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    // Remove leading zeros
    if (newValue.length > 1 && newValue.startsWith('0')) {
      newValue = newValue.replace(/^0+/, '');
      if (newValue === '') newValue = '0';
    }

    const numericValue = Number(newValue);

    // Check if value exceeds maxAmount
    if (maxAmount != null && numericValue > maxAmount) {
      newValue = String(maxAmount);
    }

    onChange(name, newValue);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-start py-4 border-b last:border-b-0 gap-4">
      <div className="flex-grow sm:w-[calc(50%-0.25rem)]">
        <label className="font-semibold text-gray-800 text-lg">{label}</label>
        {description && <p className="text-xs text-red-500">{description}</p>}
        {subDescription && <p className="text-xs text-gray-500">{subDescription}</p>}
      </div>
      <div className="flex sm:justify-end items-center gap-2 flex-shrink-0 sm:w-[calc(50%-0.25rem)]">
        <div className="w-[7.25rem] text-center">
          <span className="font-semibold text-blue-600 text-lg">
            {maxAmount ? maxAmount.toLocaleString() : "-"}
          </span>
        </div>
        <div className="w-36 relative pb-4">
          <input
            type="number"
            name={name}
            value={value ?? ""}
            onChange={internalChangeHandler}
            placeholder={placeholder}
            className="border p-2 rounded text-right w-full"
          />
          <p className="text-xs text-red-500 absolute -bottom-0 right-0 whitespace-nowrap">
            *จำนวนเงินแนะนำในการลดหย่อนภาษี
          </p>
        </div>
      </div>
    </div>
  );
};

export const TwoColResultRow: React.FC<TwoColResultRowProps> = ({ label, maxValue, calcValue }) => (
  <div className="py-4 border-b">
    <div className="flex justify-between items-start gap-4">
      <span className="font-semibold text-gray-800">{label}</span>
      <div className="flex gap-2 items-center flex-shrink-0">
        <div className="flex flex-col items-end w-28">
          <span className="text-xs text-gray-500">สูงสุด</span>
          <span className="font-semibold text-red-500">
            {maxValue.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-end w-36">
          <span className="text-xs text-gray-500">คำนวณ</span>
          <span className="font-semibold text-green-600">
            {calcValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
);