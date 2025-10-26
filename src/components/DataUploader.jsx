import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Coins } from 'lucide-react';

export default function DataUploader({ onUpload }) {
  const txRef = useRef(null);
  const empRef = useRef(null);
  const [currency, setCurrency] = useState('USD');

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
    <section className="bg-white/80 backdrop-blur border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-start md:items-center flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-100 grid place-items-center text-neutral-700">
            <Upload size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upload your CSV</h2>
            <p className="text-sm text-neutral-600">Upload transactions CSV and optionally employees CSV. You can also upload just one combined CSV.</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-sm">
          <Coins size={16} className="text-neutral-500" />
          <label className="text-neutral-700">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
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
        <div>
          <label className="text-sm font-medium text-neutral-800 flex items-center gap-2"><FileSpreadsheet size={16}/> Transactions CSV</label>
          <input ref={txRef} type="file" accept=".csv" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-800 flex items-center gap-2"><FileSpreadsheet size={16}/> Employees CSV (optional)</label>
          <input ref={empRef} type="file" accept=".csv" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800" />
        </div>
        <div className="flex items-end">
          <button onClick={handleRead} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            <Upload size={16}/> Import Data
          </button>
        </div>
      </div>
    </section>
  );
}
