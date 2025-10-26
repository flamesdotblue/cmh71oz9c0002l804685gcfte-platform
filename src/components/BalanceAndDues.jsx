import { useMemo } from 'react';
import { PieChart as PieIcon, Users, Wallet, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Donut({ data, total, colors }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const entries = Object.entries(data);
  return (
    <div className="relative">
      <svg viewBox="0 0 160 160" className="w-44 h-44">
        <defs>
          <linearGradient id="gradIn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="gradOut" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {entries.map(([k, v], idx) => {
          const frac = total ? Math.abs(v) / Math.max(Math.abs(total), 1) : 0;
          const len = frac * circumference;
          const circle = (
            <circle key={k}
              cx="80" cy="80" r={radius} fill="none"
              stroke={colors[idx % colors.length]}
              strokeWidth="18" strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return circle;
        })}
        <circle cx="80" cy="80" r={radius - 20} fill="white" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">Net</div>
          <div className="text-lg font-semibold text-neutral-900">{new Intl.NumberFormat().format(Math.round(total || 0))}</div>
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ months, formatCurrency }) {
  const maxVal = useMemo(() => {
    let m = 0;
    months.forEach(({ in: inc, out }) => {
      m = Math.max(m, inc, out);
    });
    return m || 1;
  }, [months]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-7 text-[11px] text-neutral-600 mb-2">
          <div></div>
          {months.map(m => (
            <div key={m.month} className="text-center">{m.month}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3 items-end">
          <div className="text-xs text-emerald-700 flex items-center gap-1"><ArrowUpRight size={14}/> In</div>
          {months.map(m => (
            <div key={m.month} className="h-28 bg-gradient-to-b from-emerald-50 to-emerald-50/50 border border-emerald-100 rounded-md relative">
              <div className="absolute bottom-0 left-1.5 right-1.5 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm shadow-sm" style={{ height: `${(m.in / maxVal) * 88 + 6}px` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3 items-end mt-3">
          <div className="text-xs text-rose-700 flex items-center gap-1"><ArrowDownRight size={14}/> Out</div>
          {months.map(m => (
            <div key={m.month} className="h-28 bg-gradient-to-b from-rose-50 to-rose-50/50 border border-rose-100 rounded-md relative">
              <div className="absolute bottom-0 left-1.5 right-1.5 bg-gradient-to-t from-rose-500 to-rose-400 rounded-sm shadow-sm" style={{ height: `${(m.out / maxVal) * 88 + 6}px` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-[10px] text-neutral-500 mt-2">
          <div></div>
          {months.map(m => (
            <div key={m.month} className="text-center">{formatCurrency(m.in - m.out)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BalanceAndDues({ balance, incomeTotal, expenseTotal, byCategory, employeeDues, currency, months, formatCurrency }) {
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#22d3ee', '#a78bfa'];
  const catTotal = Object.values(byCategory).reduce((a, b) => a + Math.abs(b), 0);

  return (
    <motion.section
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white/80 backdrop-blur-md border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.25)]"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 grid place-items-center text-amber-700 border border-amber-200">
              <Wallet size={20} />
            </div>
            <h3 className="text-lg font-semibold">Current Balance</h3>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4 bg-gradient-to-b from-white to-neutral-50">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight">{formatCurrency(balance, currency)}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700"><TrendingUp size={16}/> Income</div>
                <div className="text-xl font-semibold text-emerald-700 mt-1">{formatCurrency(incomeTotal, currency)}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100">
                <div className="flex items-center gap-2 text-rose-700"><TrendingDown size={16}/> Expenses</div>
                <div className="text-xl font-semibold text-rose-700 mt-1">{formatCurrency(expenseTotal, currency)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 grid place-items-center text-sky-700 border border-sky-200">
                <PieIcon size={20} />
              </div>
              <h4 className="font-semibold">Category Breakdown</h4>
            </div>
            <div className="flex items-center gap-6">
              <Donut data={byCategory} total={catTotal} colors={colors} />
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(byCategory).slice(0, 8).map(([k, v], idx) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[idx % colors.length] }} />
                    <span className="text-neutral-700 flex-1 truncate" title={k}>{k}</span>
                    <span className={`tabular-nums ${v >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{v >= 0 ? '+' : ''}{new Intl.NumberFormat().format(Math.round(v))}</span>
                  </div>
                ))}
                {Object.keys(byCategory).length === 0 && (
                  <div className="text-neutral-500">No categories yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 grid place-items-center text-violet-700 border border-violet-200">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-semibold">Employee Dues (This Month)</h3>
          </div>
          <div className="rounded-2xl border border-neutral-200 divide-y bg-gradient-to-b from-white to-neutral-50 overflow-hidden">
            {employeeDues && employeeDues.length > 0 ? employeeDues.map(e => (
              <div key={e.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-neutral-50/80 transition">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] border bg-white text-neutral-700">{e.id}</span>
                    <span>{e.name}</span>
                    {!e.active && <span className="text-xs text-neutral-500">(inactive)</span>}
                  </div>
                  <div className="text-xs text-neutral-500">{e.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500">Salary</div>
                  <div className="font-medium">{new Intl.NumberFormat().format(Math.round(e.salary))}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500">Paid</div>
                  <div className="font-medium text-emerald-700">{new Intl.NumberFormat().format(Math.round(e.paid))}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500">Due</div>
                  <div className={`font-semibold ${e.due > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{new Intl.NumberFormat().format(Math.round(e.due))}</div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-neutral-500">No employee data yet</div>
            )}
          </div>
        </div>

        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 grid place-items-center text-emerald-700 border border-emerald-200">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold">Monthly In vs Out</h3>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-4 bg-gradient-to-b from-white to-neutral-50">
            <MiniBarChart months={months} formatCurrency={formatCurrency} />
            <div className="mt-3 text-xs text-neutral-600">Last 6 months trend of income and expenses. Net values are shown below each month.</div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
