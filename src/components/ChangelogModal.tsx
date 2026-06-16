import Modal from './Modal';

interface Release {
  version: string;
  date: string;
  items: { ru: string; en: string }[];
}

const RELEASES: Release[] = [
  {
    version: '1.0',
    date: '2026-05-01',
    items: [
      { ru: 'Запуск приложения FinCalendar', en: 'FinCalendar app launch' },
      { ru: 'Счета и транзакции: расходы, доходы, переводы', en: 'Accounts & transactions: expenses, income, transfers' },
      { ru: 'Календарь платежей и планируемые расходы', en: 'Payment calendar and planned expenses' },
      { ru: 'Бюджеты с цветовыми индикаторами', en: 'Budgets with color indicators' },
      { ru: 'Долги и графики погашения', en: 'Debts and repayment schedules' },
      { ru: 'Статистика: категории, счета, тренды', en: 'Statistics: categories, accounts, trends' },
      { ru: 'Экспорт в PDF, Excel, CSV и JSON', en: 'Export to PDF, Excel, CSV, and JSON' },
      { ru: 'Умные уведомления о платежах и бюджетах', en: 'Smart notifications for payments and budgets' },
      { ru: 'Виджеты для Android', en: 'Android widgets' },
      { ru: 'Поддержка 10 валют', en: '10 currencies supported' },
      { ru: 'Русский и английский языки', en: 'Russian and English languages' },
      { ru: 'PWA: работает офлайн и на iOS как нативное приложение', en: 'PWA: works offline and on iOS as a native app' },
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: 'ru' | 'en';
}

export default function ChangelogModal({ isOpen, onClose, language }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={language === 'ru' ? 'Что нового' : "What's New"} fullHeight>
      <div className="px-5 pb-8 space-y-6">
        {RELEASES.map((release) => (
          <div key={release.version}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="px-3 py-1.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
              >
                <span className="text-sm font-bold text-white">v{release.version}</span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(release.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="space-y-2">
              {release.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: '#1E1E38', border: '1px solid #1E2A40' }}>
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: '#3B82F6' }}
                  />
                  <p className="text-sm text-slate-300">{language === 'ru' ? item.ru : item.en}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
