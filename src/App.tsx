import { useState, useEffect } from 'react';
import { Laptop, AlertCircle, CheckCircle, Lock, ClipboardList, X, Wifi, WifiOff, ChevronRight, Clock, StickyNote, UserPlus } from 'lucide-react';

type View = 'menu' | 'checkout' | 'check-in' | 'confirmation';
type ActionType = 'checkout' | 'check-in';

// NEW: We upgraded the memory to hold detailed records!
type CheckoutRecord = {
  number: string;
  studentName: string;
  note: string;
  checkoutTime: number; // Saves the exact millisecond it was checked out
};

export default function App() {
  // Navigation & UI State
  const [view, setView] = useState<View>('menu');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDashboard, setShowDashboard] = useState(false);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);

  // Form State
  const [checkoutNum, setCheckoutNum] = useState('');
  const [checkinNum, setCheckinNum] = useState('');
  const [studentName, setStudentName] = useState('');
  const [checkoutNote, setCheckoutNote] = useState(''); // NEW: Note state
  const [errorMsg, setErrorMsg] = useState('');

  // Database State (Upgraded to hold objects instead of just numbers)
  const [checkedOutList, setCheckedOutList] = useState<CheckoutRecord[]>([]);

  // Confirmation Pop-Up State
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'checkout' | 'check-in'>('checkout');

  // NEW: Live Clock for the countdown timers (Updates every 1 minute)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const formatNum = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 2);
    return digits ? parseInt(digits, 10).toString() : '';
  };

  // 1. Prepare Check Out
  const handlePrepareCheckout = () => {
    if (!checkoutNum || !studentName.trim()) {
      setErrorMsg('Please fill in both Name and Number.');
      return;
    }
    // Check if the number already exists in our upgraded list
    if (checkedOutList.some(record => record.number === checkoutNum)) {
      setErrorMsg(`Chromebook #${checkoutNum} is already checked out!`);
      return;
    }
    setErrorMsg('');
    setConfirmActionType('checkout');
    setShowConfirm(true); 
  };

  // 2. Prepare Check In
  const handlePrepareCheckin = () => {
    if (!checkinNum) {
      setErrorMsg('Please enter a Chromebook number.');
      return;
    }
    if (!checkedOutList.some(record => record.number === checkinNum)) {
      setErrorMsg(`Chromebook #${checkinNum} is not currently checked out.`);
      return;
    }
    setErrorMsg('');
    setConfirmActionType('check-in');
    setShowConfirm(true);
  };

  // 3. Execute Action
  const executeAction = () => {
    setShowConfirm(false);

    if (confirmActionType === 'checkout') {
      const newRecord: CheckoutRecord = {
        number: checkoutNum,
        studentName: studentName,
        note: checkoutNote,
        checkoutTime: Date.now() // Stamps the exact current time
      };
      setCheckedOutList([...checkedOutList, newRecord]);
      setLastAction('checkout');
      setView('confirmation');
      
      // If done from dashboard, hide the dashboard to show success screen
      if (showDashboard) setShowDashboard(false);
    } else {
      setCheckedOutList(checkedOutList.filter(record => record.number !== checkinNum));
      setLastAction('check-in');
      setView('confirmation');
    }
  };

  const resetToMenu = () => {
    setCheckoutNum('');
    setCheckinNum('');
    setStudentName('');
    setCheckoutNote('');
    setErrorMsg('');
    setView('menu');
  };

  // NEW: Calculate Time Remaining Logic
  const getTimerDisplay = (checkoutTime: number) => {
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const elapsedMs = now - checkoutTime;
    const timeLeftMs = twentyFourHoursMs - elapsedMs;

    if (timeLeftMs <= 0) return { text: 'OVERDUE', color: 'text-red-600 bg-red-100' };

    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft < 2) return { text: `${hoursLeft}h ${minutesLeft}m left`, color: 'text-orange-600 bg-orange-100' };
    return { text: `${hoursLeft}h ${minutesLeft}m left`, color: 'text-emerald-600 bg-emerald-100' };
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
          {view === 'menu' && (
            <button 
              onClick={() => {
                // Pre-clear form for dashboard use
                setCheckoutNum(''); setStudentName(''); setCheckoutNote(''); setErrorMsg('');
                setShowDashboard(true);
              }}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition"
            >
              <ClipboardList className="w-6 h-6" />
            </button>
          )}
          {isOnline ? <Wifi className="text-emerald-500 w-5 h-5" /> : <WifiOff className="text-red-500 w-5 h-5" />}
        </div>
      </header>

      {/* MAIN MENU */}
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
                type="text" placeholder="First & Last Name" value={studentName}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => { setErrorMsg(''); setStudentName(e.target.value); }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Chromebook Number</label>
              <input 
                type="text" inputMode="numeric" placeholder="(e.g. 10)" value={checkoutNum}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                onChange={(e) => { setErrorMsg(''); setCheckoutNum(formatNum(e.target.value)); }}
              />
            </div>

            {/* NEW: Note Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Note (Optional)</label>
              <input 
                type="text" placeholder="e.g. Missing charger, scratched screen..." value={checkoutNote}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setCheckoutNote(e.target.value)}
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
                type="text" inputMode="numeric" placeholder="(e.g. 10)" value={checkinNum}
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
          <div className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-2xl h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-400"/> Admin Dashboard
              </h2>
              <button onClick={() => setShowDashboard(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {/* NEW: Admin Quick Check-Out Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500"/> Quick Check Out
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" placeholder="Number (e.g. 10)" value={checkoutNum}
                    onChange={(e) => { setErrorMsg(''); setCheckoutNum(formatNum(e.target.value)); }}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    type="text" placeholder="Student Name" value={studentName}
                    onChange={(e) => { setErrorMsg(''); setStudentName(e.target.value); }}
                    className="flex-[2] p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <input 
                    type="text" placeholder="Note (Optional)" value={checkoutNote}
                    onChange={(e) => setCheckoutNote(e.target.value)}
                    className="flex-[3] p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button 
                    onClick={handlePrepareCheckout}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 px-4 transition"
                  >
                    Check Out
                  </button>
                </div>
                {errorMsg && <p className="text-red-500 text-sm mt-3 font-medium text-center">{errorMsg}</p>}
              </div>

              {/* Advanced Checked Out List */}
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-700">Currently Checked Out</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {checkedOutList.length} total
                </span>
              </div>
              
              {checkedOutList.length === 0 ? (
                <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-dashed border-slate-300">
                  <p>All Chromebooks are secure and checked in.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {/* We map over the UPGRADED list of records */}
                  {checkedOutList.map(record => {
                    const timer = getTimerDisplay(record.checkoutTime);
                    
                    return (
                      <li key={record.number} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-3 rounded-xl text-slate-500">
                              <Laptop className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 text-xl block">#{record.number}</span>
                              <span className="text-sm font-semibold text-slate-500">{record.studentName}</span>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${timer.color}`}>
                            <Clock className="w-3.5 h-3.5"/> {timer.text}
                          </span>
                        </div>
                        
                        {record.note && (
                          <div className="mt-3 bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg flex items-start gap-2 border border-yellow-100">
                            <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{record.note}</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
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
