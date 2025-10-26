import { useMemo, useState } from 'react';
import { ChevronDown, List, PlusCircle } from 'lucide-react';

export default function TransactionsPanel({ transactions, onAddTransaction, currency, formatCurrency }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: '', type: 'out', amount: '', category: '', description: '', employeeId: '' });

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
  }, [transactions]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.date || !form.amount) return;
    onAddTransaction({ ...form, amount: parseFloat(form.amount) });
    setForm({ date: '', type: 'out', amount: '', category: '', description: '', employeeId: '' });
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
            <List size={20} />
          </div>
          <h3 className="text-lg font-semibold">Transactions</h3>
        </div>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-neutral-50">
          {open ? 'Hide' : 'Show'} Details <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-1 rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-3 text-neutral-700"><PlusCircle size={18}/> Add New Transaction</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-neutral-600">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-neutral-600">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm">
                <option value="in">Income</option>
                <option value="out">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-600">Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600">Category</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g., Sales, Salary, Rent" className="mt-1 w-full border rounded-md px-2 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600">Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600">Employee ID (optional)</label>
              <input type="text" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="Link to employee for payroll" className="mt-1 w-full border rounded-md px-2 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">Add Transaction</button>
            </div>
          </div>
        </form>

        {open && (
          <div className="lg:col-span-2 rounded-xl border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-6 gap-0 text-xs font-medium text-neutral-600 bg-neutral-50 px-4 py-2">
              <div>Date</div>
              <div>Type</div>
              <div className="text-right">Amount</div>
              <div>Category</div>
              <div>Description</div>
              <div>Employee</div>
            </div>
            <div className="divide-y">
              {sorted.length > 0 ? sorted.map((t, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-0 px-4 py-2 text-sm">
                  <div className="truncate">{t.date}</div>
                  <div className={t.type === 'in' || t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}>{(t.type === 'in' || t.type === 'income') ? 'Income' : 'Expense'}</div>
                  <div className={`text-right tabular-nums ${t.type === 'in' || t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>{t.type === 'in' || t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                  <div className="truncate">{t.category || '—'}</div>
                  <div className="truncate">{t.description || '—'}</div>
                  <div className="truncate">{t.employeeId || '—'}</div>
                </div>
              )) : (
                <div className="px-4 py-6 text-neutral-500">No transactions yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
