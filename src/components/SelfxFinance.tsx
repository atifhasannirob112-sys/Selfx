import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Edit3, 
  Send, 
  Home, 
  Receipt, 
  BarChart3, 
  Target, 
  Bell, 
  Search, 
  CheckCircle2, 
  Filter, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  Coins,
  ChevronRight
} from 'lucide-react';
import { triggerNotification } from '../utils';
import financeLuxuryImg from '../assets/images/finance_luxury_banner_1789978133309.jpg';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  category: string;
  date: string;
  time?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface DebtRecord {
  id: string;
  personName: string;
  type: 'owe' | 'receivable'; // owe = আমি দেব (দেনা), receivable = আমি পাবো (পাওনা)
  amount: number;
  note?: string;
  date: string;
  isSettled: boolean;
}

interface SelfxFinanceProps {
  onClose?: () => void;
}

const STORAGE_KEY = 'selfx_finance_data_v1';
const CAPITAL_STORAGE_KEY = 'selfx_finance_capital_v1';
const GOALS_STORAGE_KEY = 'selfx_finance_goals_v1';
const DEBTS_STORAGE_KEY = 'selfx_finance_debts_v1';

// Convert English numbers to Bengali digits
export function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

// Convert Bengali digits to English digits
export function toEnglishNumber(str: string): string {
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (char) => bengaliToEnglish[char] || char);
}

// Natural Language AI Parser for Bengali / English text
export function parseBengaliAIEntry(text: string): {
  type: 'income' | 'expense' | 'savings';
  amount: number;
  title: string;
  category: string;
} | null {
  if (!text || !text.trim()) return null;

  const normalized = toEnglishNumber(text);
  // Match amount (digits with optional decimals, optionally with ৳, taka, tk)
  const amountMatch = normalized.match(/(?:৳\s*)?(\d+(?:\.\d+)?)\s*(?:টাকা|tk|taka)?/i);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
  }

  // Detect Type
  let type: 'income' | 'expense' | 'savings' = 'expense';
  if (/বেতন|ইনকাম|আয়|stipend|salary|income|টাকা পেলাম|লাভ|বোনাস|আর্নিং/i.test(normalized)) {
    type = 'income';
  } else if (/সেভিংস|সঞ্চয়|ডিপিএস|জমা|savings|deposit/i.test(normalized)) {
    type = 'savings';
  }

  // Detect Category
  let category = 'ব্যক্তিগত খরচ';
  if (/খাবার|নাস্তা|লাঞ্চ|ডিনার|রেস্টুরেন্ট|চা|কফি|বিরিয়ানি|বার্গার|ফুড|food|মিষ্টি/i.test(normalized)) {
    category = 'খাবার ও নাস্তা';
  } else if (/রিকশা|বাস|ভাড়া|উবার|পাঠাও|সিএনজি|যাতায়াত|travel|fare|transport|ট্রেন/i.test(normalized)) {
    category = 'যাতায়াত ও ভাড়া';
  } else if (/বাজার|মুদি|সবজি|মাছ|কেনাকাটা|শপিং|grocery|market|চাল|ডাল|তেল/i.test(normalized)) {
    category = 'মুদি ও বাজার';
  } else if (/বই|খাতা|পড়াশোনা|কোচিং|টিউশন|পরীক্ষা|education|study|course|পেন/i.test(normalized)) {
    category = 'শিক্ষা ও বই';
  } else if (/বিল|কারেন্ট|নেট|ইন্টারনেট|ওয়াইফাই|মোবাইল|রিচার্জ|utility|bill|গ্যাস/i.test(normalized)) {
    category = 'বিল ও রিচার্জ';
  } else if (/ঔষধ|ডাক্তার|মেডিসিন|চিকিৎসা|health|medicine/i.test(normalized)) {
    category = 'স্বাস্থ্য ও চিকিৎসা';
  } else if (type === 'income') {
    category = 'বেতন ও ইনকাম';
  } else if (type === 'savings') {
    category = 'সঞ্চয় ও ডিপোজিট';
  }

  // Clean title
  let title = text
    .replace(/^[+]/, '')
    .replace(/(?:৳\s*)?([০-৯\d]+(?:\.[০-৯\d]+)?)\s*(?:টাকা|tk|taka)?/gi, '')
    .trim();

  if (!title) {
    title = category;
  }

  return {
    type,
    amount: amount || 0,
    title,
    category
  };
}

export default function SelfxFinance({ onClose }: SelfxFinanceProps) {
  // Navigation Tabs: 'home' | 'ledger' | 'analytics' | 'goals' | 'notices'
  const [activeTab, setActiveTab] = useState<'home' | 'ledger' | 'analytics' | 'goals' | 'notices'>('home');

  // Core Finance State
  const [capital, setCapital] = useState<number>(0);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(15000);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'income', title: 'টিউশন ফি / হাতখরচ', amount: 5000, category: 'বেতন ও ইনকাম', date: '2026-11-01', time: '10:00' },
    { id: '2', type: 'expense', title: 'এইচএসসি বই ও প্র্যাকটিস পেপার', amount: 1250, category: 'শিক্ষা ও বই', date: '2026-11-03', time: '14:30' },
    { id: '3', type: 'expense', title: 'ইন্টারনেট ও মোবাইল রিচার্জ', amount: 650, category: 'বিল ও রিচার্জ', date: '2026-11-05', time: '18:15' },
    { id: '4', type: 'savings', title: 'স্টাডি ইমার্জেন্সি ডিপোজিট', amount: 1500, category: 'সঞ্চয় ও ডিপোজিট', date: '2026-11-06', time: '09:00' }
  ]);

  // Savings Goals
  const [goals, setGoals] = useState<SavingsGoal[]>([
    { id: 'g1', title: 'ল্যাপটপ / স্টাডি ড্রিম গ্যাজেট', targetAmount: 45000, currentAmount: 12000, deadline: '2026-12-31' },
    { id: 'g2', title: 'ইমার্জেন্সি সেভিংস ব্যাকআপ', targetAmount: 20000, currentAmount: 6500, deadline: '2027-02-28' }
  ]);

  // Debts & Receivables (দেনা ও পাওনা)
  const [debts, setDebts] = useState<DebtRecord[]>([
    { id: 'd1', personName: 'রাকিব (বন্ধু)', type: 'receivable', amount: 450, note: 'নাস্তার বিল শেয়ার', date: '2026-11-08', isSettled: false },
    { id: 'd2', personName: 'লাইব্রেরী দোকান', type: 'owe', amount: 180, note: 'ফটোকপি বাকি', date: '2026-11-09', isSettled: false }
  ]);

  // Auto AI Entry text field
  const [aiEntryInput, setAiEntryInput] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Modals
  const [showCapitalModal, setShowCapitalModal] = useState<boolean>(false);
  const [capitalInput, setCapitalInput] = useState<string>('0');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualType, setManualType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [manualCategory, setManualCategory] = useState<string>('খাবার ও নাস্তা');

  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalTarget, setGoalTarget] = useState<string>('');
  const [goalSaved, setGoalSaved] = useState<string>('');

  const [showDebtModal, setShowDebtModal] = useState<boolean>(false);
  const [debtPerson, setDebtPerson] = useState<string>('');
  const [debtType, setDebtType] = useState<'owe' | 'receivable'>('receivable');
  const [debtAmount, setDebtAmount] = useState<string>('');
  const [debtNote, setDebtNote] = useState<string>('');

  // Ledger Filter
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerFilterType, setLedgerFilterType] = useState<'all' | 'income' | 'expense' | 'savings'>('all');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
        }
        if (parsed.budget) setMonthlyBudget(parsed.budget);
      }

      const savedCapital = localStorage.getItem(CAPITAL_STORAGE_KEY);
      if (savedCapital !== null) {
        const parsedCap = parseFloat(savedCapital);
        if (!isNaN(parsedCap)) {
          setCapital(parsedCap);
          setCapitalInput(String(parsedCap));
        }
      }

      const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        if (Array.isArray(parsedGoals)) setGoals(parsedGoals);
      }

      const savedDebts = localStorage.getItem(DEBTS_STORAGE_KEY);
      if (savedDebts) {
        const parsedDebts = JSON.parse(savedDebts);
        if (Array.isArray(parsedDebts)) setDebts(parsedDebts);
      }
    } catch (e) {
      console.warn("Could not load stored finance data", e);
    }
  }, []);

  // Save State Helper
  const persistTransactions = (newTxList: Transaction[], newBudget: number = monthlyBudget) => {
    setTransactions(newTxList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions: newTxList, budget: newBudget }));
    } catch (err) {
      console.warn("Could not persist transactions", err);
    }
  };

  const persistCapital = (newCapital: number) => {
    setCapital(newCapital);
    try {
      localStorage.setItem(CAPITAL_STORAGE_KEY, String(newCapital));
    } catch (err) {
      console.warn("Could not persist capital", err);
    }
  };

  const persistGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    } catch (err) {
      console.warn("Could not persist goals", err);
    }
  };

  const persistDebts = (newDebts: DebtRecord[]) => {
    setDebts(newDebts);
    try {
      localStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(newDebts));
    } catch (err) {
      console.warn("Could not persist debts", err);
    }
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalSavings = useMemo(() => {
    return transactions.filter(t => t.type === 'savings').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  // Total balance = capital + totalIncome - totalExpense
  const totalBalance = useMemo(() => {
    return capital + totalIncome - totalExpense;
  }, [capital, totalIncome, totalExpense]);

  // Today's Date String: YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Today's Stats
  const todayIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.date === todayDateStr)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions, todayDateStr]);

  const todayExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date === todayDateStr)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions, todayDateStr]);

  const todaySavings = useMemo(() => {
    return transactions
      .filter(t => t.type === 'savings' && t.date === todayDateStr)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions, todayDateStr]);

  // Handle Refresh Action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerNotification("🔄 হিসাব রিফ্রেশ হয়েছে!", `বর্তমান ব্যালেন্স: ৳${totalBalance.toLocaleString()}`);
    }, 450);
  };

  // Handle Save Capital
  const handleSaveCapital = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(toEnglishNumber(capitalInput));
    if (isNaN(val) || val < 0) {
      triggerNotification("⚠️ সঠিক মূলধনের পরিমাণ লিখুন!");
      return;
    }
    persistCapital(val);
    setShowCapitalModal(false);
    triggerNotification("✅ মূলধন আপডেট সফল!", `নতুন মূলধন: ৳${val.toLocaleString()}`);
  };

  // Handle Auto AI Entry Submit
  const handleExecuteAiEntry = (inputOverride?: string) => {
    const rawText = inputOverride || aiEntryInput;
    if (!rawText.trim()) {
      triggerNotification("⚠️ বিবরণ ও টাকার পরিমাণ লিখুন!");
      return;
    }

    setIsAiProcessing(true);
    const parsed = parseBengaliAIEntry(rawText);

    if (!parsed || parsed.amount <= 0) {
      setIsAiProcessing(false);
      triggerNotification("⚠️ টাকার পরিমাণ খুঁজে পাওয়া যায়নি!", "যেমন: 'খাবার খরচ ১৫০ টাকা' বা 'বেতন ৫০০০ টাকা'");
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: parsed.type,
      title: parsed.title,
      amount: parsed.amount,
      category: parsed.category,
      date: todayDateStr,
      time: timeStr
    };

    const updated = [newTx, ...transactions];
    persistTransactions(updated);

    const typeLabel = parsed.type === 'income' ? 'আয়' : parsed.type === 'savings' ? 'সঞ্চয়' : 'খরচ';
    triggerNotification(`✅ এআই এন্ট্রি যুক্ত হয়েছে (${typeLabel})!`, `${parsed.title} - ৳${parsed.amount.toLocaleString()}`);

    setAiEntryInput('');
    setIsAiProcessing(false);
  };

  // Handle Manual Add Transaction
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(toEnglishNumber(manualAmount));
    if (!manualTitle.trim() || isNaN(val) || val <= 0) {
      triggerNotification("⚠️ সঠিক শিরোনাম ও পরিমাণ লিখুন!");
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newItem: Transaction = {
      id: Date.now().toString(),
      type: manualType,
      title: manualTitle.trim(),
      amount: val,
      category: manualCategory,
      date: todayDateStr,
      time: timeStr
    };

    const updated = [newItem, ...transactions];
    persistTransactions(updated);
    triggerNotification("✅ লেনদেন সফলভাবে যুক্ত হয়েছে!", `${newItem.title} - ৳${newItem.amount.toLocaleString()}`);
    setManualTitle('');
    setManualAmount('');
    setShowAddModal(false);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    persistTransactions(updated);
    triggerNotification("🗑️ লেনদেন মুছে ফেলা হয়েছে");
  };

  // Handle Add Savings Goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(toEnglishNumber(goalTarget));
    const saved = parseFloat(toEnglishNumber(goalSaved)) || 0;
    if (!goalTitle.trim() || isNaN(target) || target <= 0) {
      triggerNotification("⚠️ সঠিক লক্ষ্য ও পরিমাণ লিখুন!");
      return;
    }

    const newG: SavingsGoal = {
      id: 'g_' + Date.now(),
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: saved
    };

    persistGoals([newG, ...goals]);
    triggerNotification("🎯 নতুন সঞ্চয় লক্ষ্য যুক্ত হয়েছে!", `${newG.title} - ৳${target.toLocaleString()}`);
    setGoalTitle('');
    setGoalTarget('');
    setGoalSaved('');
    setShowGoalModal(false);
  };

  // Handle Add Debt
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(toEnglishNumber(debtAmount));
    if (!debtPerson.trim() || isNaN(amt) || amt <= 0) {
      triggerNotification("⚠️ ব্যক্তির নাম ও পরিমাণ লিখুন!");
      return;
    }

    const newD: DebtRecord = {
      id: 'd_' + Date.now(),
      personName: debtPerson.trim(),
      type: debtType,
      amount: amt,
      note: debtNote.trim() || undefined,
      date: todayDateStr,
      isSettled: false
    };

    persistDebts([newD, ...debts]);
    triggerNotification(
      debtType === 'receivable' ? "📥 নতুন পাওনা যুক্ত হয়েছে!" : "📤 নতুন দেনা যুক্ত হয়েছে!",
      `${debtPerson} - ৳${amt.toLocaleString()}`
    );
    setDebtPerson('');
    setDebtAmount('');
    setDebtNote('');
    setShowDebtModal(false);
  };

  // Toggle Debt Settled
  const handleToggleDebtSettled = (id: string) => {
    const updated = debts.map(d => d.id === id ? { ...d, isSettled: !d.isSettled } : d);
    persistDebts(updated);
    triggerNotification("✅ দেনা/পাওনা স্ট্যাটাস আপডেট হয়েছে");
  };

  // Filtered Ledger Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesType = ledgerFilterType === 'all' || item.type === ledgerFilterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, ledgerSearch, ledgerFilterType]);

  return (
    <div className="flex flex-col min-h-full bg-[#050914] text-zinc-100 font-sans relative selection:bg-blue-600/30">
      
      {/* Scrollable Main Workspace */}
      <div className="flex-1 p-3.5 sm:p-5 max-w-2xl mx-auto w-full space-y-4 pb-28">

        {/* ===================== TAB 1: HOME (MATCHES EXACT SCREENSHOT) ===================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Module Sub-Header Row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0e1c3b] border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md shrink-0">
                  <Wallet className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Selfx Finance
                  </h1>
                  <p className="text-xs text-blue-300/80 font-medium">
                    পার্সোনাল এআই ফাইন্যান্স লেজার
                  </p>
                </div>
              </div>

              {/* Set Capital Button (মূলধন সেট) */}
              <button
                type="button"
                onClick={() => {
                  setCapitalInput(String(capital));
                  setShowCapitalModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0c1936] hover:bg-[#12234a] border border-blue-500/35 hover:border-blue-400/60 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>মূলধন সেট</span>
              </button>
            </div>

            {/* Total Balance Card (মোট ব্যালেন্স - Total Balance) */}
            <div className="relative rounded-3xl border border-blue-500/30 bg-[#091329] p-5 overflow-hidden shadow-xl shadow-blue-950/40">
              {/* Subtle Luxury Cityscape Background */}
              <div 
                className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-screen"
                style={{ backgroundImage: `url(${financeLuxuryImg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#091329] via-[#091329]/90 to-[#0e1a38]/85 pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                
                {/* Left Side: Balance Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-200/90">
                    <span>মোট ব্যালেন্স (Total Balance)</span>
                    <button
                      type="button"
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 rounded-lg hover:bg-white/10 text-blue-300 hover:text-white transition-colors cursor-pointer"
                      title={showBalance ? "ব্যালেন্স লুকান" : "ব্যালেন্স দেখুন"}
                    >
                      {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                    {showBalance ? `৳ ${totalBalance.toLocaleString()}` : '৳ ••••••'}
                  </div>

                  {/* Capital Pill & Change Button */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-3 py-1 rounded-full bg-[#0d1c3e] border border-blue-500/30 text-blue-200 text-xs font-medium">
                      মূলধন : ৳ {capital.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCapitalInput(String(capital));
                        setShowCapitalModal(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      পরিবর্তন
                    </button>
                  </div>
                </div>

                {/* Right Side: Refresh & Wallet Icon Action */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 rounded-xl bg-[#0f214a] hover:bg-[#152e66] border border-blue-500/40 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>রিফ্রেশ</span>
                  </button>

                  <div className="w-13 h-13 rounded-2xl bg-blue-600/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-md">
                    <Wallet className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

              </div>
            </div>

            {/* 3 Summary Cards Row (আজকের আয়, আজকের খরচ, আজকের সেভিংস) */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Today's Income */}
              <div className="p-3.5 rounded-2xl bg-[#091629] border border-emerald-500/25 space-y-1 text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-[11px] text-zinc-300 font-medium pt-1">
                  আজকের আয়
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  ৳ {todayIncome.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  ৳ {toBengaliNumber(todayIncome)}
                </div>
              </div>

              {/* Today's Expense */}
              <div className="p-3.5 rounded-2xl bg-[#170e1c] border border-rose-500/25 space-y-1 text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-[11px] text-zinc-300 font-medium pt-1">
                  আজকের খরচ
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  ৳ {todayExpense.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  ৳ {toBengaliNumber(todayExpense)}
                </div>
              </div>

              {/* Today's Savings */}
              <div className="p-3.5 rounded-2xl bg-[#0c162e] border border-blue-500/25 space-y-1 text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
                  <PiggyBank className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="text-[11px] text-zinc-300 font-medium pt-1">
                  আজকের সেভিংস
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  ৳ {todaySavings.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  ৳ {toBengaliNumber(todaySavings)}
                </div>
              </div>

            </div>

            {/* Auto AI Entry Card (আজকের হিসাব লিখুন - Auto AI Entry) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0a142c] border border-blue-500/30 space-y-3.5 shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    আজকের হিসাব লিখুন (Auto AI Entry)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-900/40 border border-blue-400/30 text-blue-300 text-[10px] font-semibold">
                  অটো অ্যাড
                </span>
              </div>

              {/* Bengali Description */}
              <p className="text-xs text-blue-200/75 leading-relaxed">
                বাংলায় লিখে দিন — টাকা ও বিবরণ স্বয়ংক্রিয়ভাবে হিসাবে যুক্ত হবে।
              </p>

              {/* Natural Language Input with Send Icon Button inside */}
              <div className="relative flex items-center rounded-2xl bg-[#060b18] border border-blue-500/35 focus-within:border-blue-400 p-1.5 pl-3.5 transition-colors shadow-inner">
                <input
                  type="text"
                  value={aiEntryInput}
                  onChange={e => setAiEntryInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExecuteAiEntry();
                    }
                  }}
                  placeholder="যেমন: দুপুরের খাবার খরচ ২০০ টাকা, বা বেতন ৫০..."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteAiEntry()}
                  disabled={isAiProcessing || !aiEntryInput.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/30"
                  title="যুক্ত করুন"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Quick Preset Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleExecuteAiEntry('+ খাবার খরচ ১৫০ টাকা')}
                  className="py-2 px-3 rounded-xl bg-[#0c1836] hover:bg-[#12244f] border border-blue-500/25 hover:border-blue-400/50 text-blue-200 text-xs font-medium text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between"
                >
                  <span>+ খাবার খরচ ১৫০ টাকা</span>
                  <span className="text-[10px] text-rose-400 font-mono">-৳১৫০</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiEntry('+ রিকশা/বাস ভাড়া ৬০ টাকা')}
                  className="py-2 px-3 rounded-xl bg-[#0c1836] hover:bg-[#12244f] border border-blue-500/25 hover:border-blue-400/50 text-blue-200 text-xs font-medium text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between"
                >
                  <span>+ রিকশা/বাস ভাড়া ৬০ টাকা</span>
                  <span className="text-[10px] text-rose-400 font-mono">-৳৬০</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiEntry('+ মুদির বাজার ৫০০ টাকা')}
                  className="py-2 px-3 rounded-xl bg-[#0c1836] hover:bg-[#12244f] border border-blue-500/25 hover:border-blue-400/50 text-blue-200 text-xs font-medium text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between"
                >
                  <span>+ মুদির বাজার ৫০০ টাকা</span>
                  <span className="text-[10px] text-rose-400 font-mono">-৳৫০০</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteAiEntry('+ বেতন ইনকাম ৫০০০ টাকা')}
                  className="py-2 px-3 rounded-xl bg-[#0c1836] hover:bg-[#12244f] border border-blue-500/25 hover:border-blue-400/50 text-blue-200 text-xs font-medium text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between"
                >
                  <span>+ বেতন ইনকাম ৫০০০ টাকা</span>
                  <span className="text-[10px] text-emerald-400 font-mono">+৳৫০০০</span>
                </button>
              </div>

            </div>

            {/* Recent Transactions List on Home */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>আজকের ও সাম্প্রতিক লেনদেন</span>
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ম্যানুয়াল এন্ট্রি</span>
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className="text-[11px] text-zinc-400 hover:text-white font-medium cursor-pointer"
                  >
                    সব দেখুন ({transactions.length})
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#091226] border border-blue-500/20 hover:border-blue-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'income' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : item.type === 'savings'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : item.type === 'savings' ? <PiggyBank className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-white truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                          {item.time && (
                            <>
                              <span>•</span>
                              <span>{item.time}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs sm:text-sm font-bold font-mono ${
                        item.type === 'income' ? 'text-emerald-400' : item.type === 'savings' ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {item.type === 'income' ? '+' : item.type === 'savings' ? '★' : '-'}৳{item.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(item.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ===================== TAB 2: হিসাব খাতা (LEDGER TAB) ===================== */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Ledger Header */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-400" />
                  <span>হিসাব খাতা ও লেনদেন লেজার</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  মোট {transactions.length} টি রেকর্ড সংরক্ষিত
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন হিসাব</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  placeholder="বিবরণ বা ক্যাটাগরি দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#091226] border border-blue-500/25 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(['all', 'income', 'expense', 'savings'] as const).map(tKey => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setLedgerFilterType(tKey)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                      ledgerFilterType === tKey
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#091226] text-zinc-400 hover:text-white border border-blue-500/20'
                    }`}
                  >
                    {tKey === 'all' ? 'সব লেনদেন' : tKey === 'income' ? 'শুধু আয়' : tKey === 'expense' ? 'শুধু খরচ' : 'শুধু সঞ্চয়'}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-[#091226] border border-blue-500/20 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</p>
                </div>
              ) : (
                filteredTransactions.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#091226] border border-blue-500/20 hover:border-blue-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'income' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : item.type === 'savings'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : item.type === 'savings' ? <PiggyBank className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-white truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                          {item.time && <span>• {item.time}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-xs sm:text-sm font-bold font-mono ${
                        item.type === 'income' ? 'text-emerald-400' : item.type === 'savings' ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {item.type === 'income' ? '+' : item.type === 'savings' ? '★' : '-'}৳{item.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ===================== TAB 3: অ্যানালিটিক্স (ANALYTICS TAB) ===================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>ফাইন্যান্স অ্যানালিটিক্স ও রিপোর্ট</span>
              </h2>
              <p className="text-xs text-zinc-400">
                আয়, ব্যয় এবং সঞ্চয়ের সুষম অনুপাত ও গ্রোথ
              </p>
            </div>

            {/* Monthly Budget Bar */}
            <div className="p-4 rounded-3xl bg-[#091226] border border-blue-500/25 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">
                  মাসিক বাজেট লিমিট (৳{monthlyBudget.toLocaleString()})
                </span>
                <span className="font-mono font-bold text-blue-300">
                  খরচ: {Math.round((totalExpense / Math.max(1, monthlyBudget)) * 100)}%
                </span>
              </div>

              <div className="w-full h-3.5 rounded-full bg-zinc-800/80 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalExpense > monthlyBudget 
                      ? 'bg-rose-500 shadow-md shadow-rose-500/50' 
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((totalExpense / Math.max(1, monthlyBudget)) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>ব্যয় হয়েছে: ৳{totalExpense.toLocaleString()}</span>
                <span>অবশিষ্ট বাজেট: ৳{Math.max(0, monthlyBudget - totalExpense).toLocaleString()}</span>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#09182a] border border-emerald-500/25 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">মোট আয়</span>
                <div className="text-base font-black text-emerald-300">
                  ৳{totalIncome.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400">
                  {totalIncome > 0 ? '১০০%' : '০%'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1d0e1b] border border-rose-500/25 space-y-1">
                <span className="text-[10px] text-rose-400 font-bold uppercase">মোট ব্যয়</span>
                <div className="text-base font-black text-rose-300">
                  ৳{totalExpense.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400">
                  {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% আয়ের` : '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c1630] border border-blue-500/25 space-y-1">
                <span className="text-[10px] text-blue-400 font-bold uppercase">সঞ্চয় ভল্ট</span>
                <div className="text-base font-black text-blue-300">
                  ৳{totalSavings.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400">
                  {totalIncome > 0 ? `${Math.round((totalSavings / totalIncome) * 100)}% আয়ের` : '—'}
                </span>
              </div>
            </div>

            {/* Category Analysis */}
            <div className="p-4 rounded-3xl bg-[#091226] border border-blue-500/25 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>প্রধান খরচের ক্যাটাগরিসমূহ</span>
              </h4>

              {(() => {
                const categoryTotals: Record<string, number> = {};
                transactions.filter(t => t.type === 'expense').forEach(t => {
                  categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
                });
                const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

                if (sorted.length === 0) {
                  return <p className="text-xs text-zinc-400">এখনও কোনো খরচ রেকর্ড করা হয়নি।</p>;
                }

                return (
                  <div className="space-y-2">
                    {sorted.map(([cat, amt]) => {
                      const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-medium">{cat}</span>
                            <span className="font-mono text-zinc-200">৳{amt.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ===================== TAB 4: লক্ষ্য/দেনা (GOALS & DEBTS TAB) ===================== */}
        {activeTab === 'goals' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Savings Goals Section */}
            <div className="p-4 rounded-3xl bg-[#091226] border border-blue-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">সঞ্চয় লক্ষ্যসমূহ (Savings Goals)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>নতুন লক্ষ্য</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {goals.map(g => {
                  const pct = Math.min(100, Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100));
                  return (
                    <div key={g.id} className="p-3 rounded-2xl bg-[#060c1c] border border-blue-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{g.title}</span>
                        <span className="text-blue-400 font-mono font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>জমা: ৳{g.currentAmount.toLocaleString()}</span>
                        <span>টার্গেট: ৳{g.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Debts & Receivables (দেনা ও পাওনা) */}
            <div className="p-4 rounded-3xl bg-[#091226] border border-blue-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">দেনা ও পাওনার হিসাব (Debts & Loans)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDebtModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>যুক্ত করুন</span>
                </button>
              </div>

              <div className="space-y-2">
                {debts.map(d => (
                  <div
                    key={d.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      d.isSettled 
                        ? 'bg-zinc-900/40 border-zinc-800 opacity-60' 
                        : d.type === 'receivable'
                        ? 'bg-[#091826] border-emerald-500/30'
                        : 'bg-[#1a0f1a] border-rose-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{d.personName}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          d.type === 'receivable' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {d.type === 'receivable' ? 'পাবো (Receivable)' : 'দেনা (Owe)'}
                        </span>
                      </div>
                      {d.note && <p className="text-[11px] text-zinc-400 mt-0.5">{d.note}</p>}
                      <span className="text-[10px] text-zinc-500 block">{d.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold font-mono ${
                        d.type === 'receivable' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        ৳{d.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleDebtSettled(d.id)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          d.isSettled 
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700' 
                            : 'bg-blue-600/20 border-blue-400/40 text-blue-300 hover:bg-blue-600/40'
                        }`}
                        title={d.isSettled ? "পরিশোধ চিহ্নিত" : "পরিশোধ করুন"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ===================== TAB 5: নোটিশ (NOTICES TAB) ===================== */}
        {activeTab === 'notices' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>ফাইন্যান্স নোটিশ ও এলার্ট</span>
              </h2>
              <p className="text-xs text-zinc-400">
                বাজেট ম্যানেজমেন্ট, সেভিংস টিপস ও শৃঙ্খলা নির্দেশনা
              </p>
            </div>

            {/* Alert 1 */}
            <div className="p-4 rounded-2xl bg-[#09142e] border border-blue-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>দৈনিক ব্যয় লগইন শৃঙ্খলা</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                প্রতিদিন দুপুরের লাঞ্চ, যাতায়াত ও ছোটখাটো খরচের সাথে সাথেই Auto AI Entry তে লিখে ফেলুন। এতে দিনশেষে কোনো অপব্যয় লুকানো থাকে না।
              </p>
            </div>

            {/* Alert 2 */}
            <div className="p-4 rounded-2xl bg-[#0e1b38] border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Coins className="w-4 h-4" />
                <span>৫০/৩০/২০ সুবর্ণ ওয়েলথ নিয়ম</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                আপনার মাসিক আয়ের ৫০% মৌলিক প্রয়োজনে (খাবার, ভাড়া, বিল), ৩০% পড়াশোনা ও স্কিল কোর্সে এবং ২০% স্পর্শাতীত সঞ্চয় ভল্টে জমা করুন।
              </p>
            </div>

            {/* Alert 3 */}
            <div className="p-4 rounded-2xl bg-[#14122e] border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <PiggyBank className="w-4 h-4" />
                <span>ইমার্জেন্সি ভল্ট প্রটেকশন</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                কমপক্ষে ৩ মাসের হাতখরচ আলাদা সেভিংস হিসেবে জমিয়ে রাখুন যেন অপ্রত্যাশিত কোনো পরিস্থিতিতে পড়াশোনা বা ফোকাস ব্যাহত না হয়।
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ===================== BOTTOM NAVIGATION BAR (MATCHES EXACT SCREENSHOT) ===================== */}
      <div className="sticky bottom-0 z-30 bg-[#070e20]/95 backdrop-blur-xl border-t border-blue-500/25 py-2 px-3 sm:px-6 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Tab 1: হোম (Home) */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold tracking-wide">হোম</span>
          </button>

          {/* Tab 2: হিসাব খাতা (Ledger) */}
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer ${
              activeTab === 'ledger' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Receipt className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold tracking-wide">হিসাব খাতা</span>
          </button>

          {/* Tab 3: অ্যানালিটিক্স (Analytics) */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold tracking-wide">অ্যানালিটিক্স</span>
          </button>

          {/* Tab 4: লক্ষ্য/দেনা (Goals & Debts) */}
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer ${
              activeTab === 'goals' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Target className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-semibold tracking-wide">লক্ষ্য/দেনা</span>
          </button>

          {/* Tab 5: নোটিশ (Notices) */}
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer ${
              activeTab === 'notices' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 stroke-[2.2]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-0 right-0" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">নোটিশ</span>
          </button>

        </div>
      </div>

      {/* ===================== MODAL 1: SET CAPITAL MODAL ===================== */}
      {showCapitalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-sm w-full rounded-3xl bg-[#091329] border border-blue-500/40 p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>মূলধন সেট করুন (Initial Capital)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCapitalModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCapital} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-300 block mb-1 font-medium">
                  আপনার প্রাথমিক মূলধন বা শুরু করার ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  value={capitalInput}
                  onChange={e => setCapitalInput(e.target.value)}
                  placeholder="যেমন: 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060b18] border border-blue-500/30 text-sm text-white font-mono focus:outline-none focus:border-blue-400"
                  min="0"
                  required
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                এই মূলধনের সাথে আপনার সমস্ত আয় যুক্ত হবে এবং ব্যয় বিয়োগ হয়ে মোট ব্যালেন্স তৈরি হবে।
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCapitalModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: MANUAL TRANSACTION MODAL ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl bg-[#091329] border border-blue-500/40 p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>নতুন লেনদেন যুক্ত করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2">
                {(['expense', 'income', 'savings'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setManualType(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      manualType === t
                        ? t === 'income'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : t === 'savings'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-rose-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t === 'income' ? 'আয় (+)' : t === 'savings' ? 'সঞ্চয় (★)' : 'খরচ (-)'}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">বিবরণ / শিরোনাম</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="যেমন: দুপুরের খাবার, রিকশা ভাড়া, টিউশন ফি..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={e => setManualAmount(e.target.value)}
                  placeholder="যেমন: 250"
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                  min="1"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ক্যাটাগরি</label>
                <select
                  value={manualCategory}
                  onChange={e => setManualCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="খাবার ও নাস্তা">খাবার ও নাস্তা</option>
                  <option value="যাতায়াত ও ভাড়া">যাতায়াত ও ভাড়া</option>
                  <option value="মুদি ও বাজার">মুদি ও বাজার</option>
                  <option value="শিক্ষা ও বই">শিক্ষা ও বই</option>
                  <option value="বিল ও রিচার্জ">বিল ও রিচার্জ</option>
                  <option value="স্বাস্থ্য ও চিকিৎসা">স্বাস্থ্য ও চিকিৎসা</option>
                  <option value="বেতন ও ইনকাম">বেতন ও ইনকাম</option>
                  <option value="সঞ্চয় ও ডিপোজিট">সঞ্চয় ও ডিপোজিট</option>
                  <option value="ব্যক্তিগত খরচ">ব্যক্তিগত খরচ</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: SAVINGS GOAL MODAL ===================== */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-sm w-full rounded-3xl bg-[#091329] border border-blue-500/40 p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>নতুন সঞ্চয় লক্ষ্য</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">লক্ষ্যের নাম</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="যেমন: নতুন বই কেনা, ল্যাপটপ..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">টার্গেট অ্যামাউন্ট (৳)</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={e => setGoalTarget(e.target.value)}
                  placeholder="যেমন: 5000"
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ইতিমধ্যে জমা আছে (৳)</label>
                <input
                  type="number"
                  value={goalSaved}
                  onChange={e => setGoalSaved(e.target.value)}
                  placeholder="যেমন: 1000"
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                  min="0"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: DEBT & LOAN MODAL ===================== */}
      {showDebtModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-sm w-full rounded-3xl bg-[#091329] border border-blue-500/40 p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>দেনা বা পাওনার এন্ট্রি</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDebtModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebtType('receivable')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    debtType === 'receivable' ? 'bg-emerald-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  পাবো (Receivable)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('owe')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    debtType === 'owe' ? 'bg-rose-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  দেনা (Owe)
                </button>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ব্যক্তির নাম</label>
                <input
                  type="text"
                  value={debtPerson}
                  onChange={e => setDebtPerson(e.target.value)}
                  placeholder="যেমন: তানভীর, হাসান ভাই..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  value={debtAmount}
                  onChange={e => setDebtAmount(e.target.value)}
                  placeholder="যেমন: 500"
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">নোট / কারণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={debtNote}
                  onChange={e => setDebtNote(e.target.value)}
                  placeholder="যেমন: খাবারের বিল বাকি..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060b18] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
