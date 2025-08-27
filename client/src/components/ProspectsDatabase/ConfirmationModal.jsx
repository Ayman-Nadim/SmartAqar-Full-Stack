import React from 'react';
import { AlertTriangle, X, Trash2, UserX } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  prospectName = ""
}) => {
  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
          iconColor: 'text-red-600',
          confirmBtn: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg transform hover:scale-105',
          icon: <Trash2 className="h-7 w-7" />,
          borderAccent: 'border-t-4 border-red-500'
        };
      case 'warning':
        return {
          iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
          iconColor: 'text-yellow-600',
          confirmBtn: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500 shadow-lg transform hover:scale-105',
          icon: <AlertTriangle className="h-7 w-7" />,
          borderAccent: 'border-t-4 border-yellow-500'
        };
      default:
        return {
          iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
          iconColor: 'text-blue-600',
          confirmBtn: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg transform hover:scale-105',
          icon: <AlertTriangle className="h-7 w-7" />,
          borderAccent: 'border-t-4 border-blue-500'
        };
    }
  };

  const styles = getModalStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        {/* Header avec accent coloré */}
        <div className={`${styles.borderAccent} rounded-t-2xl`}>
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-16 w-16 ${styles.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className={styles.iconColor}>
                    {styles.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">This action requires confirmation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed text-base">
              {message}
            </p>
            
            {prospectName && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <UserX className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prospect to delete:</p>
                    <p className="text-lg font-bold text-gray-900">{prospectName}</p>
                  </div>
                </div>
              </div>
            )}
            
            {type === 'danger' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r-xl">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">
                    Warning: This action is permanent and cannot be undone
                  </p>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  All associated data will be permanently removed from the database.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 ${styles.confirmBtn} text-white rounded-xl transition-all duration-200 font-semibold focus:outline-none focus:ring-4 focus:ring-offset-2`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;