// E:\Steam\steam-website\src\pages\CustomerService\components\CreateTicket\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import TicketForm from './TicketForm';
import { useTicket } from '../../hooks/useTicket';

export const CreateTicketDialog = ({ onClose }) => {
  const { loading, createTicket, validateTicket } = useTicket();

  const handleSubmit = async (formData) => {
    const { isValid, errors } = validateTicket(formData);
    if (!isValid) return errors;

    const result = await createTicket(formData);
    if (result.success) onClose();
    return result.error;
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-[#0f1621] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#1a1f2c] to-[#252b3b] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">创建工单</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <TicketForm onSubmit={handleSubmit} isSubmitting={loading} />
      </div>
    </Modal>
  );
};
