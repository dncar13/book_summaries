import type { Metadata } from 'next';
import { HebrewText } from '@/components/HebrewText';

export const metadata: Metadata = {
  title: 'About LearnFlow',
  description: 'הסיפור שלנו ולמה הכריכות והטקסטים תמיד מקוריים.'
};

export default function AboutPage() {
  return (
    <section className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">קצת על LearnFlow</h1>
      <HebrewText className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
        LearnFlow נבנתה עבור לומדות עבריות שרוצות אימון קריאה באנגלית שאינו תלוי ספריות חיצוניות. כל סיפור הוא סיכום
        נרטיבי באורך 1,800–2,200 מילים שנכתב על ידינו בלבד, ללא ציטוטים ארוכים וללא אזכורים של שמות ספרים מסחריים.
        הכריכות הן SVGים גנרטיביים ולכן אינן מעתיקות עטיפות קיימות.
      </HebrewText>
      <HebrewText className="text-base leading-7 text-slate-600 dark:text-slate-300">
        המערכת אינה דורשת הרשמה, והתקדמות נשמרת מקומית כדי לשמור על פרטיותך. אירועי שימוש נשלחים ל-Supabase דרך מפתח
        public עם RLS שמאפשר רק הוספה, כדי שנוכל ללמוד אילו סיפורים מושכים תשומת לב. אין גישה לנתוני קריאה אישיים.
      </HebrewText>
      <HebrewText className="text-base leading-7 text-slate-600 dark:text-slate-300">
        LearnFlow מחויבת לשפה נוחה ברמת B1-B2, לכתיבה עיתונאית בהירה, ולסגנון RTL שנוח לנייד. מוזמנת לחלוק משוב—כל
        רעיון הופך במהירות לניסוי חדש.
      </HebrewText>
    </section>
  );
}
