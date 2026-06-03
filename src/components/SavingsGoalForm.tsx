import { useState } from 'react';
import { format, addMonths } from 'date-fns';
import { useStore } from '../store';
import { translations } from '../translations';
import { Currency, SavingsGoal } from '../types';
import { ACCOUNT_ICONS, ACCOUNT_COLORS } from '../utils';
import { ChevronDown } from 'lucide-react';

interface Props {
  goal?: SavingsGoal;
  onClose: () => void;
}

export default function SavingsGoalForm({ goal, onClose }: Props) {
  const { language, defaultCurrency, addSavingsGoal, updateSavingsGoal } = useStore();
  const t = translations[language];

  const [name, setName] = useState(goal?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : '');
  const [currency, setCurrency] = useState<SavingsGoal['currency']>(goal?.currency ?? (defaultCurrency as Currency));
  const [deadline, setDeadline] = useState(goal?.deadline ?? format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [icon, setIcon] = useState(goal?.icon ?? '🎯');
  const [color, setColor] = useState(goal?.color ?? '#3B82F6');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t.nameRequired;
    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) e.amount = t.amountRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currency,
      deadline,
      icon,
      color,
    };

    if (goal) {
      updateSavingsGoal(goal.id, data);
    } else {
      addSavingsGoal(data);
    }
    onClose();
  };

  return (
    <div className="px-5 pb-8 space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.savingsGoalName}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === 'ru' ? 'Новая цель накоплений' : 'New savings goal'}
          className="w-full px-4 py-3"
          style={{
            background: '#1E1E38',
            border: errors.name ? '1px solid #EF4444' : '1px solid #1E2A40',
            borderRadius: 12,
            color: '#F1F5F9',
          }}
          autoFocus
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Target Amount */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.savingsGoalTarget}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0"
            className="flex-1 px-4 py-3 text-2xl font-bold"
            style={{
              background: '#1E1E38',
              border: errors.amount ? '1px solid #EF4444' : '1px solid #1E2A40',
              borderRadius: 12,
              color: '#F1F5F9',
            }}
          />
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="px-3 py-3 appearance-none pr-8 rounded-xl text-sm font-semibold text-slate-300"
              style={{ background: '#1E1E38', border: '1px solid #1E2A40', minWidth: 70 }}
            >
              {(['RUB', 'USD', 'EUR', 'GBP', 'KZT', 'CNY', 'UAH', 'BYN', 'AED', 'TRY'] as Currency[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.savingsGoalDeadline}</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
          className="w-full px-4 py-3"
          style={{ background: '#1E1E38', border: '1px solid #1E2A40', borderRadius: 12, color: '#F1F5F9' }}
        />
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.icon}</label>
        <div className="flex gap-2 flex-wrap">
          {ACCOUNT_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className="w-12 h-12 rounded-xl text-xl flex items-center justify-center active-scale"
              style={{
                background: icon === ic ? `${color}30` : '#1E1E38',
                border: icon === ic ? `2px solid ${color}` : '1.5px solid #1E2A40',
              }}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.color}</label>
        <div className="flex gap-2 flex-wrap">
          {ACCOUNT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-full active-scale"
              style={{
                background: c,
                border: color === c ? '3px solid white' : '3px solid transparent',
                boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl font-medium text-slate-300 active-scale"
          style={{ background: '#1E1E38', border: '1px solid #1E2A40' }}
        >
          {t.cancel}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-white active-scale"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
}