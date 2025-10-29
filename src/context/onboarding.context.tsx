import { SurveyData } from "@/utils/onboarding";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface OnboardingContextType {
  surveyData: Partial<SurveyData>;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  clearSurveyData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});

  const updateSurveyData = (data: Partial<SurveyData>) => {
    setSurveyData((prev) => ({ ...prev, ...data }));
  };

  const clearSurveyData = () => {
    setSurveyData({});
  };

  return (
    <OnboardingContext.Provider
      value={{
        surveyData,
        updateSurveyData,
        clearSurveyData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
