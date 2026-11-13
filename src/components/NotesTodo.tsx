import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, CheckCircle2, Circle, ShoppingCart, CheckSquare, 
  Trash, Sparkles, Filter, CheckCircle, RefreshCw 
} from 'lucide-react';
import { TodoItem } from '../types';
import { triggerNotification } from '../utils';

interface NotesTodoProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export default function NotesTodo({ todos, setTodos }: NotesTodoProps) {
  const [todoInput, setTodoInput] = useState('');
  const [category, setCategory] = useState<'all' | 'shopping' | 'todo' | 'finance'>('all');
  const [itemType, setItemType] = useState<'shopping' | 'todo'>('shopping');

  // Finance State
  const [financeCategory, setFinanceCategory] = useState<'income' | 'expense'>('expense');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeNote, setFinanceNote] = useState('');
  const [financeLogs, setFinanceLogs] = useState<{ id: string; type: 'income' | 'expense'; amount: number; note: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_finance_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', type: 'income', amount: 5000, note: 'মাসিক বাজেট/ইনকাম', date: new Date().toISOString().split('T')[0] },
      { id: '2', type: 'expense', amount: 1350, note: 'CeraVe Face Wash (Arogga)', date: new Date().toISOString().split('T')[0] }
    ];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('selfx_finance_logs_v1', JSON.stringify(financeLogs));
    } catch (e) {}
  }, [financeLogs]);

  // Add shopping or task list item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: todoInput.trim(),
      completed: false,
      category: itemType 
    };

    setTodos(prev => [newItem, ...prev]);
    setTodoInput('');
    triggerNotification(
      itemType === 'shopping' ? "🛒 Shopping Item Added" : "🎯 Task Added", 
      `"${newItem.text}" has been added to your lists.`
    );
  };

  const handleToggleItem = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          triggerNotification("✅ Completed!", `"${t.text}" is done!`);
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleDeleteItem = (id: string, text: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    triggerNotification("🗑️ Item Removed", `"${text}" has been deleted.`);
  };

  const handleClearCompleted = () => {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;
    setTodos(prev => prev.filter(t => !t.completed));
    triggerNotification("🧹 Cleared Completed", `Cleaned up ${completedCount} completed items.`);
  };

  // Filter items
  const filteredTodos = todos.filter(t => {
    if (category === 'all') return true;
    return (t as any).category === category;
  });

  return (
    <div id="shopping-checklist-dashboard" className="max-w-3xl mx-auto space-y-6 animate-fadeIn text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-display font-black tracking-tight text-gold-400 flex items-center gap-2">
            <ShoppingCart className="w-5.5 h-5.5 text-gold-400" />
            Shopping & Personal Checklist
          </h2>
          <p className="text-xs text-zinc-550 font-mono">
            Track looksmaxing products to buy, supplements, or micro-discipline items in one clean list.
          </p>
        </div>

        {todos.some(t => t.completed) && (
          <button
            onClick={handleClearCompleted}
            className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-[10px] text-red-400 hover:text-red-300 font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            Clear Completed
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT CARD: INPUT CONTROLLER */}
        <div className="md:col-span-5 bg-[#121214] border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-xl">
          
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <div className="p-1.5 bg-gold-400/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-zinc-300">
                Add New Item
              </h3>
              <p className="text-[9px] text-zinc-550 font-mono">Create shopping items or personal tasks</p>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            
            {/* Type selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Item Category</label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setItemType('shopping')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    itemType === 'shopping'
                      ? 'bg-gold-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🛒 Shopping List
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('todo')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    itemType === 'todo'
                      ? 'bg-gold-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🎯 Daily Tasks
                </button>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Item Name</label>
              <input
                type="text"
                required
                placeholder={itemType === 'shopping' ? "e.g., Ceramide Face Wash or Omega-3..." : "e.g., Morning 15 mins reading..."}
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-100 placeholder-zinc-750 focus:outline-none focus:border-gold-500 transition-colors font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-zinc-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95 uppercase tracking-wider"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              Add to Active list
            </button>
          </form>

          {/* Quick preset chips to quickly add */}
          <div className="pt-2">
            <span className="block text-[9px] font-mono text-zinc-550 uppercase mb-2">Click to quick-add:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { text: 'Sunscreen SPF 50', cat: 'shopping' },
                { text: 'Face Wash (Ceramide)', cat: 'shopping' },
                { text: 'Hair Growth Serum', cat: 'shopping' },
                { text: 'Multivitamin Supplements', cat: 'shopping' },
                { text: 'Gym Workout Routine', cat: 'todo' },
                { text: 'Drink 3.5L Water', cat: 'todo' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newItem: TodoItem = {
                      id: crypto.randomUUID(),
                      text: p.text,
                      completed: false,
                      category: p.cat as any
                    };
                    setTodos(prev => [newItem, ...prev]);
                    triggerNotification("⚡ Quick Added", `Added "${p.text}"!`);
                  }}
                  className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-[10px] text-zinc-400 rounded-lg hover:text-gold-400 cursor-pointer transition-colors"
                >
                  + {p.text}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT CARD: FILTERABLE LIST DISPLAY */}
        <div className="md:col-span-7 bg-[#121214] border border-zinc-850 rounded-2xl p-5 shadow-xl min-h-[400px] flex flex-col">
          
          {/* List Headers & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-900 gap-3">
            <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-zinc-300">
              Your Active List ({filteredTodos.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-900 text-[10px]">
              <button
                onClick={() => setCategory('all')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  category === 'all' ? 'bg-gold-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategory('shopping')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  category === 'shopping' ? 'bg-gold-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Shopping
              </button>
              <button
                onClick={() => setCategory('todo')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  category === 'todo' ? 'bg-gold-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setCategory('finance')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  category === 'finance' ? 'bg-gold-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                💰 Finance
              </button>
            </div>
          </div>

          {/* FINANCE & EXPENSE MANAGER VIEW */}
          {category === 'finance' ? (
            <div className="space-y-4 pt-4">
              {(() => {
                const totalIncome = financeLogs.filter(l => l.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
                const totalExpense = financeLogs.filter(l => l.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
                const balance = totalIncome - totalExpense;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-850 text-center">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">ইনকাম (Income)</span>
                        <span className="text-sm font-black text-emerald-300">৳{totalIncome}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-red-400 font-bold block">খরচ (Expense)</span>
                        <span className="text-sm font-black text-red-300">৳{totalExpense}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block">ব্যালেন্স (Balance)</span>
                        <span className="text-sm font-black text-amber-300">৳{balance}</span>
                      </div>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const amt = parseFloat(financeAmount);
                        if (!amt || isNaN(amt)) return;
                        const newLog = {
                          id: crypto.randomUUID(),
                          type: financeCategory,
                          amount: amt,
                          note: financeNote.trim() || (financeCategory === 'income' ? 'টাকা যোগ করা হয়েছে' : 'দৈনিক খরচ'),
                          date: new Date().toISOString().split('T')[0]
                        };
                        setFinanceLogs(prev => [newLog, ...prev]);
                        setFinanceAmount('');
                        setFinanceNote('');
                        triggerNotification(
                          financeCategory === 'income' ? "💰 টাকা যোগ হয়েছে" : "💸 খরচ যুক্ত হয়েছে",
                          `৳${amt} (${newLog.note})`
                        );
                      }}
                      className="space-y-2 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-850"
                    >
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFinanceCategory('income')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            financeCategory === 'income' ? 'bg-emerald-500 text-zinc-950 font-black' : 'bg-zinc-950 text-zinc-400'
                          }`}
                        >
                          + ইনকাম (Income)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinanceCategory('expense')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            financeCategory === 'expense' ? 'bg-red-500 text-white font-black' : 'bg-zinc-950 text-zinc-400'
                          }`}
                        >
                          - খরচ (Expense)
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="পরিমাণ (৳)..."
                          value={financeAmount}
                          onChange={(e) => setFinanceAmount(e.target.value)}
                          className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="বিবরণ (যেমন: ফেসওয়াশ কেনা / হাতখরচ)..."
                          value={financeNote}
                          onChange={(e) => setFinanceNote(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                        >
                          সেভ
                        </button>
                      </div>
                    </form>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">সর্বশেষ হিসেব ({financeLogs.length}):</span>
                      {financeLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${log.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="font-medium text-zinc-200">{log.note}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">({log.date})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${log.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.type === 'income' ? '+' : '-'}৳{log.amount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFinanceLogs(prev => prev.filter(l => l.id !== log.id))}
                              className="text-zinc-600 hover:text-red-400 cursor-pointer p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <></>
          )}

          {/* List viewport */}
          <div className="flex-1 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-850 pr-1.5 pt-4">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16 text-zinc-650 flex flex-col items-center justify-center gap-2.5">
                <div className="w-12 h-12 bg-zinc-950/80 rounded-full flex items-center justify-center border border-zinc-900 text-zinc-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                  List is Empty
                </p>
                <p className="text-[10px] text-zinc-550 leading-relaxed max-w-xs mx-auto text-center">
                  Use the left panel to add your active shopping targets or habits checklist. Mark them off once complete!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTodos.map((item) => {
                  const isShopping = (item as any).category === 'shopping' || !(item as any).category;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 group transition-all duration-300 ${
                        item.completed
                          ? 'bg-zinc-950/20 border-zinc-900/60'
                          : 'bg-zinc-950/50 border-zinc-850 hover:bg-zinc-950 hover:border-zinc-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                      >
                        <div className="shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-gold-400 stroke-[3]" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-700 hover:text-gold-500 transition-colors" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-xs block leading-relaxed ${item.completed ? 'text-zinc-650 line-through' : 'text-zinc-200 font-medium'}`}>
                            {item.text}
                          </span>
                          <span className="block text-[8px] font-mono uppercase font-bold text-zinc-600">
                            {isShopping ? '🛒 Shopping Item' : '🎯 Task/Habit'}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.text)}
                        className="text-zinc-750 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="text-[10px] text-zinc-600 font-mono border-t border-zinc-900 pt-3 flex items-center justify-between">
            <span>Total: {filteredTodos.length} items</span>
            <span>Completed: {filteredTodos.filter(t => t.completed).length} items</span>
          </div>

        </div>

      </div>

    </div>
  );
}
