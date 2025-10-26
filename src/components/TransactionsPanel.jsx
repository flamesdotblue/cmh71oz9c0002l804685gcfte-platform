import { useMemo, useState } from 'react';
import { ChevronDown, List, PlusCircle, Calendar, Tag, FileText, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
    <section className="bg-white/80 backdrop-blur-md border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neutral-100 to-white grid place-items-center text-neutral-700 border">
            <List size={20} />
          </div>
          <h3 className="text-lg font-semibold">Transactions</h3>
        </div>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm bg-white hover:bg-neutral-50">
          {open ? 'Hide' : 'Show'} Details <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={submit} className="xl:col-span-1 rounded-2xl border border-neutral-200 p-4 bg-gradient-to-b from-white to-neutral-50">
          <div className="flex items-center gap-2 mb-4 text-neutral-700 font-medium"><PlusCircle size={18}/> Add New Transaction</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-neutral-600 flex items-center gap-2"><Calendar size={14}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm bg-white" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600">Type</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'in' }))} className={`px-3 py-2 rounded-md border text-sm flex items-center justify-center gap-2 ${form.type === 'in' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-neutral-50'}`}>
                  <ArrowUpRight size={16}/> Income
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'out' }))} className={`px-3 py-2 rounded-md border text-sm flex items-center justify-center gap-2 ${form.type === 'out' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-neutral-50'}`}>
                  <ArrowDownRight size={16}/> Expense
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-600">Amount</label>
              <div className="mt-1 flex items-center border rounded-md px-2 py-2 bg-white">
                <span className="text-xs text-neutral-500 mr-2">{currency}</span>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-600 flex items-center gap-2"><Tag size={14}/> Category</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g., Sales, Salary, Rent" className="mt-1 w-full border rounded-md px-2 py-2 text-sm bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600 flex items-center gap-2"><FileText size={14}/> Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full border rounded-md px-2 py-2 text-sm bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-600 flex items-center gap-2"><User size={14}/> Employee ID (optional)</label>
              <input type="text" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="Link to employee for payroll" className="mt-1 w-full border rounded-md px-2 py-2 text-sm bg-white" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition shadow-lg">Add Transaction</button>
            </div>
          </div>
        </form>

        <div className="xl:col-span-2">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="tx-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="rounded-2xl border border-neutral-200 overflow-hidden bg-white"
              >
                <div className="grid grid-cols-6 gap-0 text-xs font-medium text-neutral-600 bg-neutral-50/80 px-4 py-2 sticky top-0">
                  <div>Date</div>
                  <div>Type</div>
                  <div className="text-right">Amount</div>
                  <div>Category</div>
                  <div>Description</div>
                  <div>Employee</div>
                </div>
                <div className="divide-y">
                  {sorted.length > 0 ? sorted.map((t, idx) => {
                    const isIn = t.type === 'in' || t.type === 'income';
                    return (
                      <div key={idx} className="grid grid-cols-6 gap-0 px-4 py-2 text-sm hover:bg-neutral-50">
                        <div className="truncate">{t.date}</div>
                        <div className={isIn ? 'text-emerald-700' : 'text-rose-700'}>{isIn ? 'Income' : 'Expense'}</div>
                        <div className={`text-right tabular-nums ${isIn ? 'text-emerald-700' : 'text-rose-700'}`}>{isIn ? '+' : '-'}{formatCurrency(t.amount)}</div>
                        <div className="truncate">{t.category || '—'}</div>
                        <div className="truncate">{t.description || '—'}</div>
                        <div className="truncate">{t.employeeId || '—'}</div>
                      </div>
                    );
                  }) : (
                    <div className="px-4 py-6 text-neutral-500">No transactions yet</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
