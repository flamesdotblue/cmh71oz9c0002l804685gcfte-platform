import { useRef, useState, useMemo } from 'react';
import { Upload, FileSpreadsheet, Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataUploader({ onUpload }) {
  const txRef = useRef(null);
  const empRef = useRef(null);
  const [currency, setCurrency] = useState('USD');
  const [isHover, setIsHover] = useState(false);

  const gradientStyle = useMemo(() => ({
    background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(167,139,250,0.12))',
  }), []);

  const handleRead = async () => {
    const txFile = txRef.current?.files?.[0];
    const empFile = empRef.current?.files?.[0];
    const read = (f) => new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsText(f);
    });

    let txText = '';
    let empText = '';
    if (txFile) txText = await read(txFile);
    if (empFile) empText = await read(empFile);

    onUpload({ transactionsCSV: txText || null, employeesCSV: empText || null, currencyGuess: currency });
  };

  return (
    <motion.section
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-2xl border border-neutral-200/70 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden"
      style={gradientStyle}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-10 -left-10 h-40 w-40 rounded-full blur-2xl transition ${isHover ? 'opacity-60' : 'opacity-30'} bg-cyan-300/40`} />
        <div className={`absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-2xl transition ${isHover ? 'opacity-60' : 'opacity-30'} bg-fuchsia-300/40`} />
      </div>

      <div className="relative p-5 md:p-6" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
        <div className="flex items-start md:items-center flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/80 backdrop-blur grid place-items-center text-neutral-700 border">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">Upload your CSV <Sparkles size={16} className="text-cyan-600"/></h2>
              <p className="text-sm text-neutral-700">Import transactions and employees to power your dashboard. You can also upload a single combined CSV.</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm">
            <Coins size={16} className="text-neutral-700" />
            <label className="text-neutral-800">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded-md px-2 py-1 text-sm bg-white/80 backdrop-blur">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>INR</option>
              <option>AUD</option>
              <option>CAD</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group">
            <label className="text-sm font-medium text-neutral-800 flex items-center gap-2"><FileSpreadsheet size={16}/> Transactions CSV</label>
            <input ref={txRef} type="file" accept=".csv" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 bg-white/80 backdrop-blur border rounded-md" />
          </div>
          <div className="group">
            <label className="text-sm font-medium text-neutral-800 flex items-center gap-2"><FileSpreadsheet size={16}/> Employees CSV (optional)</label>
            <input ref={empRef} type="file" accept=".csv" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 bg-white/80 backdrop-blur border rounded-md" />
          </div>
          <div className="flex items-end">
            <button onClick={handleRead} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition shadow-lg">
              <Upload size={16}/> Import Data
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
