// components/Modal.tsx
import React, { FC, ReactNode } from 'react';

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
}

const Modal: FC<ModalProps> = ({ children, onClose }) => {
    return (
        // Overlay (พื้นหลังทึบ)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Modal Content */}
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative">
                {/* ปุ่มปิด */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;