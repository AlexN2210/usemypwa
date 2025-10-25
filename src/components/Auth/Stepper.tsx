import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`ml-1 sm:ml-2 text-xs font-medium hidden sm:block ${
                    isCompleted || isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
