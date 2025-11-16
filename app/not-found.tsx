import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="text-right">
      <p className="text-sm text-slate-500">שגיאה 404</p>
      <h1 className="mt-2 text-3xl font-bold">העמוד לא קיים</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        ייתכן שהסיפור הועבר או שגיאת כתיב קטנה החליקה פנימה. חזרי לעמוד הראשי ובחרי סיפור אחר.
      </p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-brand-teal px-6 py-3 text-white">
        חזרה לעמוד הבית
      </Link>
    </section>
  );
}
