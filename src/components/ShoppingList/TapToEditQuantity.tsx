
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface TapToEditQuantityProps {
  quantity: number;
  isChecked: boolean;
  onQuantityChange: (newQuantity: number) => void;
}

export const TapToEditQuantity: React.FC<TapToEditQuantityProps> = ({
  quantity,
  isChecked,
  onQuantityChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input value when quantity changes externally
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // Auto focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    if (!isChecked) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    validateAndSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateAndSave();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const validateAndSave = () => {
    // Parse as integer and ensure it's valid
    const newValue = parseInt(inputValue, 10);
    
    // Cancel editing first
    setIsEditing(false);
    
    // Handle invalid input
    if (isNaN(newValue) || newValue < 0) {
      setInputValue(quantity.toString());
      return;
    }
    
    // Confirm if setting to zero
    if (newValue === 0 && quantity > 0) {
      setShowConfirmDialog(true);
      return;
    }
    
    // Apply the change if it's different
    if (newValue !== quantity) {
      onQuantityChange(newValue);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setInputValue(quantity.toString());
  };

  const confirmRemoval = () => {
    setShowConfirmDialog(false);
    onQuantityChange(0);
  };

  const cancelRemoval = () => {
    setShowConfirmDialog(false);
    setInputValue(quantity.toString());
  };

  return (
    <>
      <div className="min-w-[40px] text-center">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-14 h-8 p-1 text-center transition-all ${isChecked ? 'text-gray-400' : ''}`}
            type="number"
            min="0"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ) : (
          <div
            onClick={handleStartEditing}
            className={`flex items-center justify-center py-1 px-2 rounded-md transition-colors cursor-pointer ${
              isChecked ? 'text-gray-500' : 'hover:bg-gray-100'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Redigera antal"
          >
            <span className={`font-medium ${isChecked ? 'text-gray-500' : ''}`}>
              {quantity}
            </span>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort vara</AlertDialogTitle>
            <AlertDialogDescription>
              Om du sätter antalet till 0 kommer varan att tas bort från din inköpslista. Är du säker?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoval}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoval}>Ta bort</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
