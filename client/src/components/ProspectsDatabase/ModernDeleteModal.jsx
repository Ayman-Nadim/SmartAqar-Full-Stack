import React, { useEffect, useState } from 'react';
import { X, Trash2, AlertTriangle, Shield, User } from 'lucide-react';

const ModernDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  prospectName = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black bg-opacity-70 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Header avec animation de danger */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Delete Prospect</h2>
                  <p className="text-red-100 text-sm">Permanent action required</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Prospect Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Target prospect</p>
                <p className="text-xl font-bold text-gray-900">{prospectName}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-4">
            <p className="text-gray-700 text-base leading-relaxed">
              You are about to <span className="font-semibold text-red-600">permanently delete</span> this prospect from your database.
            </p>
            
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 text-sm">⚠️ This action cannot be undone</h4>
                  <ul className="text-red-700 text-xs mt-2 space-y-1">
                    <li>• All prospect information will be lost</li>
                    <li>• Contact history will be deleted</li>
                    <li>• Preferences and notes will be removed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all duration-200 border border-gray-300 hover:border-gray-400"
            >
              ✅ Keep Prospect
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              🗑️ Delete Forever
            </button>
          </div>
        </div>

        {/* Footer avec effet subtil */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-b-3xl"></div>
      </div>
    </div>
  );
};

export default ModernDeleteModal;