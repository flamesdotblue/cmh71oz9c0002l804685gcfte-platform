import { useMemo } from 'react';
import { PieChart as PieIcon, Users, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

function Donut({ data, total, colors }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const entries = Object.entries(data);
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#eee" strokeWidth="18" />
      {entries.map(([k, v], idx) => {
        const frac = total ? Math.abs(v) / Math.abs(total) : 0;
        const len = frac * circumference;
        const circle = (
          <circle key={k}
            cx="70" cy="70" r={radius} fill="none"
            stroke={colors[idx % colors.length]}
            strokeWidth="18" strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return circle;
      })}
      <circle cx="70" cy="70" r={radius - 18} fill="white" />
    </svg>
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
      <div className="min-w-[520px]">
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-2">
          <div></div>
          {months.map(m => (
            <div key={m.month} className="text-center">{m.month}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 items-end">
          <div className="text-xs text-neutral-600">In</div>
          {months.map(m => (
            <div key={m.month} className="h-28 bg-neutral-100 rounded-md relative">
              <div className="absolute bottom-0 left-0 right-0 p-1 text-center text-[10px] text-neutral-600">{formatCurrency(m.in)}</div>
              <div className="absolute bottom-6 left-2 right-2 bg-emerald-500/80 rounded-sm" style={{ height: `${(m.in / maxVal) * 80 + 4}px` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 items-end mt-2">
          <div className="text-xs text-neutral-600">Out</div>
          {months.map(m => (
            <div key={m.month} className="h-28 bg-neutral-100 rounded-md relative">
              <div className="absolute bottom-0 left-0 right-0 p-1 text-center text-[10px] text-neutral-600">{formatCurrency(m.out)}</div>
              <div className="absolute bottom-6 left-2 right-2 bg-rose-500/80 rounded-sm" style={{ height: `${(m.out / maxVal) * 80 + 4}px` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BalanceAndDues({ balance, incomeTotal, expenseTotal, byCategory, employeeDues, currency, months, formatCurrency }) {
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
  const catTotal = Object.values(byCategory).reduce((a, b) => a + Math.abs(b), 0);

  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
              <Wallet size={20} />
            </div>
            <h3 className="text-lg font-semibold">Current Balance</h3>
          </div>
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-3xl font-semibold">{formatCurrency(balance, currency)}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700"><TrendingUp size={16}/> Income</div>
                <div className="text-xl font-medium text-emerald-700 mt-1">{formatCurrency(incomeTotal, currency)}</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2 text-rose-700"><TrendingDown size={16}/> Expenses</div>
                <div className="text-xl font-medium text-rose-700 mt-1">{formatCurrency(expenseTotal, currency)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
                <PieIcon size={20} />
              </div>
              <h4 className="font-semibold">Category Breakdown</h4>
            </div>
            <div className="flex items-center gap-6">
              <Donut data={byCategory} total={catTotal} colors={colors} />
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(byCategory).slice(0, 6).map(([k, v], idx) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[idx % colors.length] }} />
                    <span className="text-neutral-700 flex-1">{k}</span>
                    <span className={`tabular-nums ${v >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{v >= 0 ? '+' : ''}{formatCurrency(v)}</span>
                  </div>
                ))}
                {Object.keys(byCategory).length === 0 && (
                  <div className="text-neutral-500">No categories yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-semibold">Employee Payment Dues (This Month)</h3>
          </div>
          <div className="rounded-xl border border-neutral-200 divide-y">
            {employeeDues && employeeDues.length > 0 ? employeeDues.map(e => (
              <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{e.name} {e.active ? '' : <span className="text-xs text-neutral-500">(inactive)</span>}</div>
                  <div className="text-xs text-neutral-500">{e.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Salary</div>
                  <div className="font-medium">{formatCurrency(e.salary)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Paid</div>
                  <div className="font-medium text-emerald-700">{formatCurrency(e.paid)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Due</div>
                  <div className={`font-semibold ${e.due > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatCurrency(e.due)}</div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-neutral-500">No employee data yet</div>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold">Monthly In vs Out</h3>
          </div>
          <div className="rounded-xl border border-neutral-200 p-4">
            <MiniBarChart months={months} formatCurrency={formatCurrency} />
            <div className="mt-3 text-xs text-neutral-600">Shows last 6 months trend of income and expenses.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
