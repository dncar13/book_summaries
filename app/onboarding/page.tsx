import { Metadata } from 'next';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export const metadata: Metadata = {
  title: 'LearnFlow — הכוונה התחלתית',
  description: 'שני שלבים קצרים כדי לתכנן קצב קריאה ולהבין את שיטת LearnFlow.'
};

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">מוכנות להתחיל?</h1>
      <p className="text-right text-slate-600 dark:text-slate-300">
        ההכוונה נמשכת שתי דקות: הסבר על השיטה ובחירת קצב קריאה באנגלית. אל דאגה, אין צורך בהרשמה—we שומרים רק נתונים מקומיים על ההתקדמות.
      </p>
      <OnboardingSteps />
    </div>
  );
}
