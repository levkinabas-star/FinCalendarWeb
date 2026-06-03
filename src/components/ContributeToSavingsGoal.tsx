import { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { translations } from '../translations';
import { formatAmount, CURRENCY_SYMBOLS } from '../utils';
import { SavingsGoal } from '../types';

interface Props {
  goal: SavingsGoal;
  onClose: () => void;
}

export default function ContributeToSavingsGoal({ goal, onClose }: Props) {
  const { language, accounts, contributeToSavingsGoal, withdrawFromSavingsGoal } = useStore();
  const t = translations[language];

  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [withdraw, setWithdraw] = useState(false);

  const fromAccount = accounts.find((a) => a.id === accountId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || parseFloat(amount) <= 0) e.amount = t.amountRequired;
    if (!accountId) e.from = t.accountRequired;
    if (!withdraw && fromAccount && parseFloat(amount) > fromAccount.balance) {
      e.amount = t.savingsGoalInsufficientFunds;
    }
    if (withdraw && parseFloat(amount) > goal.currentAmount) {
      e.amount = language === 'ru' ? 'Сумма превышает накопленное' : 'Amount exceeds saved balance';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (withdraw) {
      withdrawFromSavingsGoal(goal.id, accountId, parsedAmount, date);
    } else {
      contributeToSavingsGoal(goal.id, accountId, parsedAmount, date);
    }
    onClose();
  };

  return (
    <div className="px-5 pb-8 space-y-5">
      {/* Goal info header */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: `${goal.color}15`,
          border: `1px solid ${goal.color}30`,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${goal.color}20` }}
        >
          <span className="text-2xl">{goal.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{goal.name}</p>
          <p className="text-xs text-slate-400">
            {t.savingsGoalCurrent}: {formatAmount(goal.currentAmount, goal.currency)}
            <span className="mx-1">/</span>
            {formatAmount(goal.targetAmount, goal.currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: goal.color }}>
            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
          </p>
        </div>
      </div>

      {/* Contribute / Withdraw toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setWithdraw(false)}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: !withdraw ? '#3B82F6' : '#1E1E38',
            color: !withdraw ? '#fff' : '#94A5B8',
            border: `1px solid ${!withdraw ? '#3B82F6' : '#1E2A40'}`,
          }}
        >
          {t.savingsGoalContribute}
        </button>
        <button
          onClick={() => setWithdraw(true)}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: withdraw ? '#EF4444' : '#1E1E38',
            color: withdraw ? '#fff' : '#94A5B8',
            border: `1px solid ${withdraw ? '#EF4444' : '#1E2A40'}`,
          }}
        >
          {t.savingsGoalWithdraw}
        </button>
      </div>

      {/* From account */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
          {t.savingsGoalFromAccount}
        </label>
        <div className="flex flex-col gap-2">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccountId(acc.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm active-scale"
              style={{
                background: accountId === acc.id ? `${acc.color}22` : '#1E1E38',
                border: accountId === acc.id ? `1.5px solid ${acc.color}` : '1.5px solid #1E2A40',
              }}
            >
              <span>{acc.icon}</span>
              <div className="text-left flex-1 min-w-0">
                <p className="text-slate-200 font-medium text-xs leading-tight">{acc.name}</p>
                <p className="text-slate-500 text-[10px]">{formatAmount(acc.balance, acc.currency)}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.from && <p className="text-red-400 text-xs mt-1">{errors.from}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
          {t.savingsGoalAmount}
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 pr-14 text-xl font-bold"
            style={{
              background: '#1E1E38',
              border: errors.amount ? '1px solid #EF4444' : '1px solid #1E2A40',
              borderRadius: 12,
              color: withdraw ? '#EF4444' : '#10B981',
            }}
            autoFocus
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            {fromAccount ? CURRENCY_SYMBOLS[fromAccount.currency] : CURRENCY_SYMBOLS[goal.currency]}
          </span>
        </div>
        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
        {withdraw && (
          <p className="text-[10px] text-slate-500 mt-1">{t.savingsGoalWithdrawDesc}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.date}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3"
          style={{ background: '#1E1E38', border: '1px solid #1E2A40', borderRadius: 12, color: '#F1F5F9' }}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{t.description}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={language === 'ru' ? 'Комментарий...' : 'Comment...'}
          className="w-full px-4 py-3"
          style={{ background: '#1E1E38', border: '1px solid #1E2A40', borderRadius: 12, color: '#F1F5F9' }}
        />
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
          style={{ background: withdraw ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
        >
          {withdraw ? t.savingsGoalWithdraw : t.savingsGoalContribute}
        </button>
      </div>
    </div>
  );
}
