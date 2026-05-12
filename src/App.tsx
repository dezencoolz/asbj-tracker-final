import { useState, useEffect } from 'react';
import { Laptop, AlertCircle, CheckCircle, Lock, ClipboardList, X, Wifi, WifiOff, ChevronRight } from 'lucide-react';

type View = 'menu' | 'checkout' | 'check-in' | 'confirmation';
type ActionType = 'checkout' | 'check-in';

export default function App() {
  // Navigation & UI State
  const [view, setView] = useState<View>('menu');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);

  // Form State
  const [checkoutNum, setCheckoutNum] = useState('');
  const [checkinNum, setCheckinNum] = useState('');
  const [studentName, setStudentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Database State (Short-term memory for now)
  const [checkedOutList, setCheckedOutList] = useState<string[]>([]);

  // NEW: Confirmation Pop-Up State
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'checkout' | 'check-in'>('checkout');

  // Network Status Monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format numbers: Limits to 2 digits, turns "09" into "9" automatically
  const formatNum = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 2);
    return digits ? parseInt(digits, 10).toString() : '';
  };

  // 1. Prepare Check Out (Opens Modal)
  const handlePrepareCheckout = () => {
    if (!checkoutNum || !studentName.trim()) {
      setErrorMsg('Please fill in both fields.');
      return;
    }
    if (checkedOutList.includes(checkoutNum)) {
      setErrorMsg(`Chromebook #${checkoutNum} is already checked out!`);
      return;
    }
    setErrorMsg('');
    setConfirmActionType('checkout');
    setShowConfirm(true); // Open the pop-up!
  };

  // 2. Prepare Check In (Opens Modal)
  const handlePrepareCheckin = () => {
    if (!checkinNum) {
      setErrorMsg('Please enter a Chromebook number.');
      return;
    }
    if (!checkedOutList.includes(checkinNum)) {
      setErrorMsg(`Chromebook #${checkinNum} is not currently checked out.`);
      return;
    }
    setErrorMsg('');
    setConfirmActionType('check-in');
    setShowConfirm(true); // Open the pop-up!
  };

  // 3. Execute Action (Runs when they click "Confirm" inside the modal)
  const executeAction = () => {
    setShowConfirm(false); // Close the modal

    if (confirmActionType === 'checkout') {
      setCheckedOutList([...checkedOutList, checkoutNum]);
      setLastAction('checkout');
      setView('confirmation');
    } else {
      setCheckedOutList(checkedOutList.filter(num => num !== checkinNum));
      setLastAction('check-in');
      setView('confirmation');
    }
  };

  // Resets the app back to the main menu
  const resetToMenu = () => {
    setCheckoutNum('');
    setCheckinNum('');
    setStudentName('');
    setErrorMsg('');
    setView('menu');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Laptop className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">ChromeTrack</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Admin Dashboard Button */}
          {view === 'menu' && (
            <button 
              onClick={() => setShowDashboard(true)}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition"
            >
              <ClipboardList className="w-6 h-6" />
            </button>
          )}
          {/* Wifi Indicator */}
          {isOnline ? (
            <Wifi className="text-emerald-500 w-5 h-5" />
          ) : (
            <WifiOff className="text-red-500 w-5 h-5" />
          )}
        </div>
      </header>

      {/* MAIN MENU VIEW */}
      {view === 'menu' && (
        <main className="w-full max-w-md flex flex-col gap-4">
          <button 
            onClick={() => { setView('checkout'); setErrorMsg(''); }}
            className="group flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Laptop className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-800">Check Out</h2>
                <p className="text-sm text-slate-500">Take a Chromebook</p>
              </div>
            </div>
            <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
          </button>

          <button 
            onClick={() => { setView('check-in'); setErrorMsg(''); }}
            className="group flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-800">Check In</h2>
                <p className="text-sm text-slate-500">Return a Chromebook</p>
              </div>
            </div>
            <ChevronRight className="text-slate-400 group-hover:text-emerald-500" />
          </button>
        </main>
      )}

      {/* CHECKOUT VIEW */}
      {view === 'checkout' && (
        <main className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Check Out</h2>
            <button onClick={resetToMenu} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"><X className="w-5 h-5"/></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Student Name</label>
              <input 
                type="text" 
                placeholder="First & Last Name" 
                value={studentName}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => { setErrorMsg(''); setStudentName(e.target.value); }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Chromebook Number</label>
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="(e.g. 10)" 
                value={checkoutNum}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                onChange={(e) => { setErrorMsg(''); setCheckoutNum(formatNum(e.target.value)); }}
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={handlePrepareCheckout}
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </main>
      )}

      {/* CHECK-IN VIEW */}
      {view === 'check-in' && (
        <main className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Check In</h2>
            <button onClick={resetToMenu} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"><X className="w-5 h-5"/></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Chromebook Number</label>
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="(e.g. 10)" 
                value={checkinNum}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold"
                onChange={(e) => { setErrorMsg(''); setCheckinNum(formatNum(e.target.value)); }}
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={handlePrepareCheckin}
              className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </main>
      )}

      {/* CONFIRMATION / SUCCESS VIEW */}
      {view === 'confirmation' && (
        <main className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-500 mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
          <p className="text-slate-500 mb-8 text-lg">
            Chromebook <span className="font-bold text-slate-700">#{lastAction === 'checkout' ? checkoutNum : checkinNum}</span> has been 
            {lastAction === 'checkout' ? ' checked out to ' : ' checked in.'}
            {lastAction === 'checkout' && <span className="font-bold text-slate-700">{studentName}</span>}
          </p>
          <button 
            onClick={resetToMenu}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-lg transition-colors"
          >
            Done
          </button>
        </main>
      )}

      {/* ADMIN DASHBOARD MODAL */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-4 z-40 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl sm:rounded-2xl h-[80vh] sm:h-[600px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-400"/> Admin Dashboard
              </h2>
              <button onClick={() => setShowDashboard(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-700">Currently Checked Out</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {checkedOutList.length} total
                </span>
              </div>
              
              {checkedOutList.length === 0 ? (
                <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-dashed border-slate-300">
                  <p>All Chromebooks are checked in.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {checkedOutList.map(num => (
                    <li key={num} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Laptop className="text-slate-400 w-5 h-5" />
                        <span className="font-bold text-slate-700 text-lg">#{num}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* THE NEW CONFIRMATION POP-UP MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Are you sure?</h2>
            <p className="text-slate-600 mb-8 text-lg">
              You are about to <span className="font-bold">{confirmActionType === 'checkout' ? 'Check Out' : 'Check In'}</span> Chromebook 
              <span className="font-bold text-slate-800"> #{confirmActionType === 'checkout' ? checkoutNum : checkinNum}</span>.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                className={`flex-1 px-4 py-4 text-white rounded-xl font-bold transition shadow-lg ${
                  confirmActionType === 'checkout' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
