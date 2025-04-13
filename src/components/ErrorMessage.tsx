import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <p className="text-lg font-medium text-gray-900">{message}</p>
      <p className="text-sm text-gray-500">
        Vänligen försök igen eller kontakta support om problemet kvarstår.
      </p>
    </div>
  );
}; 