import { useState, useEffect } from 'react';
import {
  Laptop, AlertCircle, CheckCircle, 
  Lock, ClipboardList, X, 
  Wifi, WifiOff, ChevronRight, Info, Clock
} from 'lucide-react';

type View = 'menu' | 'checkout' | 'check-in' | 'confirmation';
type ActionType = 'checkout' | 'check-in';

// NEW: We define exactly what a "Checkout Record" looks like
type CheckoutRecord = {
  number: string;
  studentName: string;
  timestamp: number;
};

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);

  // --- Live "Database" State (Upgraded to hold objects) ---
  const [checkedOutList, setCheckedOutList] = useState<CheckoutRecord[]>([]);
  const [checkoutNum, setCheckoutNum] = useState('');
  const [checkinNum, setCheckinNum] = useState('');
  const [studentName, setStudentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'checkout' | 'check-in'>('checkout');

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
     let clean = val.replace(/\D/g, '');
     if (clean.length > 2) clean = clean.slice(0, 2);
     if (clean !== '') {
        const num = parseInt(clean, 10);
        if (num === 0) clean = '';
        else clean = num.toString();
     }
     return clean;
  };

  const closeToMenu = () => {
     setErrorMsg('');
     setCheckoutNum('');
     setCheckinNum('');
     setStudentName('');
     setView('menu');
  };

  const handleCheckout = () => {
     if (!checkoutNum || !studentName) {
        setErrorMsg('Please enter both the number and name.');
        return;
     }
     // We now check if any record in the list has this number
     if (checkedOutList.some(record => record.number === checkoutNum)) {
        setErrorMsg(`Chromebook #${checkoutNum} is already checked out!`);
        return;
     }
     setConfirmActionType('checkout');
     setShowConfirmModal(true);
  };

  const handleCheckin = () => {
     if (!checkinNum) {
        setErrorMsg('Please enter a Chromebook number.');
        return;
     }
     if (!checkedOutList.some(record => record.number === checkinNum)) {
        setErrorMsg(`Chromebook #${checkinNum} is NOT checked out!`);
        return;
     }
     setConfirmActionType('check-in');
     setShowConfirmModal(true);
  };

  const executeAction = () => {
     setShowConfirmModal(false);

     if (confirmActionType === 'checkout') {
        // NEW: Create a full package of data when checking out
        const newRecord: CheckoutRecord = {
           number: checkoutNum,
           studentName: studentName,
           timestamp: Date.now() // Captures the exact moment they confirm
        };
        setCheckedOutList([...checkedOutList, newRecord]);
        setLastAction('checkout');
        setView('confirmation');
     } else {
        // NEW: Filter out the specific record by number
        setCheckedOutList(checkedOutList.filter(record => record.number !== checkinNum));
        setLastAction('check-in');
        setView('confirmation');
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Laptop className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Chrome<span className="text-blue-600 font-medium">Track</span></h1>
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-1">ASBJKT TECHNOLOGY • Beta 1.5.5</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        {view === 'menu' && (
          <div className="w-full space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Chromebook Station</h2>
              <p className="text-slate-300 text-sm">Please select your action below</p>
            </div>
            <button onClick={() => { closeToMenu(); setView('checkout'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-4 group">
               <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors"><Laptop /></div>
               <div className="text-left"><div className="font-bold text-lg">Check Out</div><div className="text-blue-100 text-xs">Take a Chromebook</div></div>
               <ChevronRight className="ml-auto opacity-50" />
            </button>
            <button onClick={() => { closeToMenu(); setView('check-in'); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-4 group">
               <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors"><CheckCircle /></div>
               <div className="text-left"><div className="font-bold text-lg">Check In</div><div className="text-emerald-50 text-xs">Return a Chromebook</div></div>
               <ChevronRight className="ml-auto opacity-50" />
            </button>
            <button onClick={() => setShowPasswordModal(true)} className="w-full mt-8 py-3 text-slate-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Lock className="w-4 h-4" /> Teacher Access
            </button>
          </div>
        )}

        {view === 'checkout' && (
          <div className="w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Checkout</h2>
                <button onClick={closeToMenu} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {errorMsg}</div>}
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Chromebook Number</label>
                   <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="(e.g. 10)" 
                      value={checkoutNum}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) => {
                        setErrorMsg('');
                        setCheckoutNum(formatNum(e.target.value));
                      }}
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Student Full Name</label>
                   <input 
                      type="text" 
                      placeholder="(e.g. John Doe)" 
                      value={studentName}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      onChange={(e) => {
                        setErrorMsg('');
                        setStudentName(e.target.value.replace(/[^a-zA-Z\s.]/g, ''));
                      }}
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Notes (Optional)</label>
                   <textarea placeholder="(e.g. for Science class)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"></textarea>
                </div>
                <button onClick={handleCheckout} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700">Review Checkout</button>
             </div>
          </div>
        )}

        {view === 'check-in' && (
          <div className="w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Return Chromebook</h2>
                <button onClick={closeToMenu} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {errorMsg}</div>}
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Chromebook Number</label>
                   <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="(e.g. 10)"
                      value={checkinNum} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      onChange={(e) => {
                        setErrorMsg('');
                        setCheckinNum(formatNum(e.target.value));
                      }}
                   />
                </div>
                <button onClick={handleCheckin} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600">Review Check In</button>
             </div>
          </div>
        )}

        {view === 'confirmation' && (
          <div className="text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold mb-2">Success!</h2>
             <p className="text-slate-500 mb-8">
               {lastAction === 'checkout' ? 'The Chromebook has been checked out.' : 'The Chromebook has been checked in.'}
             </p>
             <button onClick={closeToMenu} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Home</button>
          </div>
        )}
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-6">Confirm Details</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-4 mb-8 border border-slate-200">
              {confirmActionType === 'checkout' ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Name</span>
                    <span className="font-bold text-slate-800 text-lg">{studentName}</span>
                  </div>
                  <div className="w-full h-px bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chromebook</span>
                    <span className="font-bold text-slate-800 text-xl">#{checkoutNum}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Returning Chromebook</span>
                  <span className="font-bold text-slate-800 text-xl">#{checkinNum}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction} 
                className={`flex-1 py-4 text-white rounded-xl font-bold shadow-lg ${
                  confirmActionType === 'checkout' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <Lock />
            </div>
            <h3 className="text-xl font-bold mb-6">Teacher Portal</h3>
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="w-full p-4 bg-slate-100 border-none rounded-2xl mb-4 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value === 'asbjkt25') {
                  setShowPasswordModal(false);
                  setShowDashboard(true);
                }
              }}
            />
            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 text-sm font-medium hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}

      {showDashboard && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <header className="p-6 border-b flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="text-blue-600" /> Teacher Dashboard</h2>
            <button onClick={() => setShowDashboard(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X /></button>
          </header>
          <div className="p-6 flex-1 bg-slate-50 overflow-auto">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="text-slate-400 text-sm font-bold uppercase mb-1">Chromebooks Checked Out</div>
                   <div className="text-3xl font-black">{checkedOutList.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="text-slate-400 text-sm font-bold uppercase mb-1">System Status</div>
                   <div className="text-green-500 font-bold flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     Online
                   </div>
                </div>
             </div>
             <div className="mt-8">
                {checkedOutList.length === 0 ? (
                  <div className="text-center text-slate-400 py-20 border-2 border-dashed border-slate-200 rounded-3xl">
                    No active checkouts found.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
                    <h3 className="font-bold text-slate-700 px-2">Currently Borrowed:</h3>
                    
                    {/* NEW: The Dashboard List now maps through the objects and shows Name and Time */}
                    {checkedOutList.map(record => (
                      <div key={record.number} className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">Chromebook #{record.number}</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-md font-bold uppercase tracking-wider">Checked Out</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <span className="font-medium text-slate-700">Student:</span> 
                           <span className="font-bold">{record.studentName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-600/80 font-medium">
                           <Clock className="w-3.5 h-3.5" /> 
                           {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    ))}

                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
