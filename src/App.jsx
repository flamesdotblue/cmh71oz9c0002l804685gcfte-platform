import { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import DataUploader from './components/DataUploader';
import BalanceAndDues from './components/BalanceAndDues';
import TransactionsPanel from './components/TransactionsPanel';
import { motion } from 'framer-motion';

// Basic CSV parser supporting quoted fields and commas within quotes
function parseCSV(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = '';
  };
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (char === ',') {
        pushField();
        i++;
        continue;
      }
      if (char === '\n') {
        pushField();
        if (row.length === 1 && row[0] === '') {
          row = [];
          i++;
          continue;
        }
        rows.push(row);
        row = [];
        i++;
        continue;
      }
      if (char === '\r') {
        i++;
        continue;
      }
      field += char;
      i++;
    }
  }
  // push last field/row
  if (field.length > 0 || row.length > 0) {
    pushField();
    if (row.length > 0) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1).filter(r => r.some(cell => cell && cell.trim() !== '')).map(r => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim();
    });
    return obj;
  });
  return data;
}

function toNumber(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9\.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseDate(d) {
  if (!d) return null;
  const t = new Date(d);
  if (!isNaN(t.getTime())) return t;
  const m = String(d).match(/^(\d{1,2})[\/. -](\d{1,2})[\/. -](\d{2,4})$/);
  if (m) {
    const dd = parseInt(m[1]);
    const mm = parseInt(m[2]) - 1;
    const yy = parseInt(m[3].length === 2 ? '20' + m[3] : m[3]);
    const d2 = new Date(yy, mm, dd);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}

function formatCurrency(n, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n || 0);
  } catch {
    return `$${(n || 0).toFixed(2)}`;
  }
}

function monthKey(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [transactions, setTransactions] = useLocalState('app_transactions', []);
  const [employees, setEmployees] = useLocalState('app_employees', []);
  const [currency, setCurrency] = useLocalState('app_currency', 'USD');

  const { balance, incomeTotal, expenseTotal, byCategory, monthly } = useMemo(() => {
    const byCat = {};
    let inc = 0;
    let exp = 0;
    const monthlyAgg = {};
    for (const t of transactions) {
      const amt = toNumber(t.amount);
      const type = (t.type || '').toLowerCase();
      const cat = (t.category || 'Uncategorized') || 'Uncategorized';
      const d = parseDate(t.date);
      if (type === 'in' || type === 'income') inc += amt; else exp += amt;
      byCat[cat] = (byCat[cat] || 0) + amt * (type === 'in' || type === 'income' ? 1 : -1);
      if (d) {
        const key = monthKey(d);
        if (!monthlyAgg[key]) monthlyAgg[key] = { in: 0, out: 0 };
        if (type === 'in' || type === 'income') monthlyAgg[key].in += amt; else monthlyAgg[key].out += amt;
      }
    }
    const bal = inc - exp;
    const monthlyArr = Object.entries(monthlyAgg)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ month: k, ...v }));
    return { balance: bal, incomeTotal: inc, expenseTotal: exp, byCategory: byCat, monthly: monthlyArr };
  }, [transactions]);

  const employeeDues = useMemo(() => {
    const now = new Date();
    const mkey = monthKey(now);
    const pays = {};
    for (const t of transactions) {
      const d = parseDate(t.date);
      if (!d) continue;
      if (monthKey(d) !== mkey) continue;
      const type = (t.type || '').toLowerCase();
      if (type !== 'out' && type !== 'expense') continue;
      const cat = (t.category || '').toLowerCase();
      if (cat.includes('salary') || cat.includes('payroll') || cat.includes('wage')) {
        const eid = (t.employeeId || t.employee || '').toString().trim();
        if (!eid) continue;
        pays[eid] = (pays[eid] || 0) + toNumber(t.amount);
      }
    }
    return employees.map(e => {
      const eid = (e.employeeId || e.id || e.EmployeeID || '').toString().trim();
      const salary = toNumber(e.salary || e.Salary || e.monthlySalary || 0);
      const paid = pays[eid] || 0;
      const due = Math.max(0, salary - paid);
      const active = String(e.active ?? e.Active ?? e.status ?? e.Status ?? 'true').toLowerCase();
      const isActive = active === 'true' || active === 'active' || active === '1' || active === 'yes';
      return { id: eid || e.name || 'N/A', name: e.name || e.Name || `Employee ${eid || ''}`, role: e.role || e.Role || '', salary, paid, due, active: isActive };
    });
  }, [employees, transactions]);

  function normalizeTransactionRow(row) {
    const out = { ...row };
    out.date = row.date || row.Date || row.timestamp || row.Timestamp || '';
    out.type = (row.type || row.Type || '').toLowerCase();
    out.amount = toNumber(row.amount || row.Amount || 0);
    out.category = row.category || row.Category || '';
    out.description = row.description || row.Details || row.Description || '';
    out.employeeId = row.employeeId || row.EmployeeID || row.employee || '';
    if (!(out.type === 'in' || out.type === 'income' || out.type === 'out' || out.type === 'expense')) {
      out.type = out.amount >= 0 ? 'in' : 'out';
      out.amount = Math.abs(out.amount);
    }
    return out;
  }

  function normalizeEmployeeRow(row) {
    const out = { ...row };
    out.employeeId = row.employeeId || row.EmployeeID || row.id || row.ID || '';
    out.name = row.name || row.Name || '';
    out.role = row.role || row.Role || '';
    out.salary = toNumber(row.salary || row.Salary || row.monthlySalary || 0);
    out.active = row.active ?? row.Active ?? row.status ?? row.Status ?? 'true';
    return out;
  }

  const handleUpload = ({ transactionsCSV, employeesCSV, currencyGuess }) => {
    const tx = transactionsCSV ? parseCSV(transactionsCSV).map(normalizeTransactionRow) : [];
    const em = employeesCSV ? parseCSV(employeesCSV).map(normalizeEmployeeRow) : [];
    if (!employeesCSV && transactionsCSV) {
      const rows = parseCSV(transactionsCSV);
      const looksLikeEmployee = rows.length > 0 && rows.every(r => (r.name || r.Name) && (r.salary || r.Salary));
      if (looksLikeEmployee) {
        setEmployees(rows.map(normalizeEmployeeRow));
      } else {
        setTransactions(rows.map(normalizeTransactionRow));
      }
    }
    if (tx.length) setTransactions(tx);
    if (em.length) setEmployees(em);
    if (currencyGuess) setCurrency(currencyGuess);
  };

  const addTransaction = (t) => {
    const newTx = normalizeTransactionRow(t);
    setTransactions(prev => [newTx, ...prev]);
  };

  const monthsForChart = useMemo(() => {
    const map = new Map(monthly.map(m => [m.month, m]));
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      arr.push({ month: key, in: map.get(key)?.in || 0, out: map.get(key)?.out || 0 });
    }
    return arr;
  }, [monthly]);

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(56,189,248,0.25),transparent),radial-gradient(1200px_800px_at_-10%_10%,rgba(167,139,250,0.20),transparent)] text-neutral-900">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-50 bg-cyan-300/30" />
        <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full blur-3xl opacity-40 bg-fuchsia-300/30" />
      </div>

      <div className="relative h-[56vh] w-full overflow-hidden rounded-b-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white" />
        <HeroCover />
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 pb-8">
          <motion.h1
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl md:text-6xl font-semibold tracking-tight drop-shadow-sm"
          >
            Finance & Team Command Center
          </motion.h1>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-sm md:text-base text-neutral-700 mt-3"
          >
            Upload your data, track balance and dues, visualize cashflow, and add new transactions instantly.
          </motion.p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 -mt-20 space-y-6">
        <DataUploader onUpload={handleUpload} />
        <BalanceAndDues
          balance={balance}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
          byCategory={byCategory}
          employeeDues={employeeDues}
          currency={currency}
          months={monthsForChart}
          formatCurrency={formatCurrency}
        />
        <TransactionsPanel
          transactions={transactions}
          onAddTransaction={addTransaction}
          currency={currency}
          formatCurrency={formatCurrency}
        />
        <footer className="py-8 text-center text-xs text-neutral-500">
          Built for your private workflow. Data stays in your browser.
        </footer>
      </main>
    </div>
  );
}
