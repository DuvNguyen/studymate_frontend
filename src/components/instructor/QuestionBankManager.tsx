'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit3, Save, X, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/Button';

interface QuestionBankManagerProps {
  courseId: number;
  onClose: () => void;
}

export default function QuestionBankManager({ courseId, onClose }: QuestionBankManagerProps) {
  const { getToken } = useAuth();
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Question editing state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [difficulty, setDifficulty] = useState('EASY');
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${courseId}/question-banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanks(data.data || data);
      }
    } catch (e) {
      toast.error('Lỗi khi tải ngân hàng câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async () => {
    if (!newBankName.trim()) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/question-banks`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newBankName, courseId })
      });
      if (res.ok) {
        toast.success('Đã tạo ngân hàng câu hỏi');
        setNewBankName('');
        setIsAddingBank(false);
        fetchBanks();
      }
    } catch (e) {
      toast.error('Lỗi khi tạo ngân hàng');
    }
  };

  const fetchBankDetail = async (bankId: number) => {
    setIsDetailLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/question-banks/${bankId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBank(data.data || data);
      }
    } catch (e) {
      toast.error('Lỗi khi tải chi tiết');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (options.some(o => !o.text.trim())) {
      toast.error('Vui lòng nhập đầy đủ các lựa chọn');
      return;
    }
    if (!options.some(o => o.isCorrect)) {
      toast.error('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }

    try {
      const token = await getToken();
      const url = editingQuestion 
        ? `http://localhost:3001/api/v1/instructor/questions/${editingQuestion.id}`
        : `http://localhost:3001/api/v1/instructor/question-banks/${selectedBank.id}/questions`;
      
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionText,
          questionType: 'MCQ',
          difficulty,
          options: options.map(o => ({ optionText: o.text, isCorrect: o.isCorrect }))
        })
      });

      if (res.ok) {
        toast.success(editingQuestion ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi');
        setIsAddingQuestion(false);
        setEditingQuestion(null);
        setQuestionText('');
        setDifficulty('EASY');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);
        fetchBankDetail(selectedBank.id);
      }
    } catch (e) {
      toast.error('Lỗi khi lưu câu hỏi');
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Đã xóa câu hỏi');
        fetchBankDetail(selectedBank.id);
      }
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-5xl h-[90vh] flex flex-col shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-yellow-400">
           <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-black">Quản lý Ngân hàng câu hỏi</h2>
           <button onClick={onClose} className="bg-white border-2 md:border-4 border-black p-2 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-px active:translate-y-px">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r-4 border-black overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <span className="font-black uppercase text-xs text-black">Danh sách Ngân hàng</span>
                <button 
                  onClick={() => setIsAddingBank(true)}
                  className="bg-black text-white p-1 border-2 border-black hover:bg-emerald-400 hover:text-black transition-all"
                >
                  <Plus size={16} />
                </button>
             </div>

             {isAddingBank && (
               <div className="space-y-2 border-2 border-black p-2 bg-white">
                  <input 
                    type="text" 
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    placeholder="Tên ngân hàng..."
                    className="w-full border-2 border-black p-2 text-sm font-bold outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateBank} className="flex-1 bg-black text-white py-1 text-xs font-black uppercase">Lưu</button>
                    <button onClick={() => setIsAddingBank(false)} className="flex-1 border-2 border-black py-1 text-xs font-black uppercase">Hủy</button>
                  </div>
               </div>
             )}

             <div className="space-y-2">
               {loading ? (
                 <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin"></div></div>
               ) : (
                 banks.map(bank => (
                   <button
                     key={bank.id}
                     onClick={() => fetchBankDetail(bank.id)}
                     className={`w-full text-left p-3 border-2 border-black font-black uppercase text-sm transition-all ${
                       selectedBank?.id === bank.id ? 'bg-black text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                     }`}
                   >
                     {bank.title}
                   </button>
                 ))
               )}
               {!loading && banks.length === 0 && <p className="text-[10px] font-bold text-center uppercase opacity-50 pt-8">Chưa có ngân hàng nào</p>}
             </div>
          </div>

          {/* Main Area - Questions */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
             {selectedBank ? (
               <div className="space-y-8">
                  <div className="flex justify-between items-end border-b-4 border-black pb-4">
                     <div>
                        <span className="text-[10px] font-black uppercase opacity-60">Đang chọn:</span>
                        <h3 className="text-2xl font-black uppercase">{selectedBank.title}</h3>
                     </div>
                     {!isAddingQuestion && (
                       <Button 
                         onClick={() => {
                           setIsAddingQuestion(true);
                           setEditingQuestion(null);
                           setQuestionText('');
                           setDifficulty('EASY');
                           setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);
                         }}
                         className="bg-emerald-400 hover:bg-emerald-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                       >
                         <Plus className="mr-2" /> THÊM CÂU HỎI
                       </Button>
                     )}
                  </div>

                  {isAddingQuestion ? (
                    <div className="border-4 border-black p-6 bg-yellow-50 space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="font-black uppercase italic text-xl">{editingQuestion ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi mới'}</h4>
                          <button onClick={() => setIsAddingQuestion(false)}><X /></button>
                       </div>

                       <div className="space-y-4">
                          <div>
                             <label className="block text-xs font-black uppercase mb-1">Nội dung câu hỏi</label>
                             <textarea 
                               value={questionText}
                               onChange={e => setQuestionText(e.target.value)}
                               className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-white min-h-[100px]"
                               placeholder="VD: Thủ đô của Việt Nam là gì?"
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-black uppercase mb-1">Độ khó</label>
                                 <select 
                                   value={difficulty}
                                   onChange={e => setDifficulty(e.target.value)}
                                   className="w-full border-4 border-black p-3 font-black outline-none"
                                 >
                                    <option value="EASY">DỄ (EASY)</option>
                                    <option value="MEDIUM">VỪA (MEDIUM)</option>
                                    <option value="HARD">KHÓ (HARD)</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-black uppercase mb-1 text-black">Điểm số</label>
                                 <input type="number" defaultValue="1" disabled className="w-full border-4 border-black p-3 font-black bg-gray-100 italic text-black" title="Mặc định 1 điểm" />
                              </div>
                           </div>

                          <div className="space-y-3">
                             <label className="block text-xs font-black uppercase mb-1 text-black">Các lựa chọn đáp án</label>
                             {options.map((opt, idx) => (
                               <div key={idx} className="flex gap-3">
                                  <button 
                                    onClick={() => {
                                      const newOpts = [...options];
                                      newOpts[idx].isCorrect = !newOpts[idx].isCorrect;
                                      setOptions(newOpts);
                                    }}
                                    className={`w-12 h-12 flex items-center justify-center border-4 border-black transition-all ${opt.isCorrect ? 'bg-emerald-400 shadow-none translate-y-px' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                                  >
                                     {opt.isCorrect ? <CheckCircle2 className="text-black" /> : <Circle className="text-black" />}
                                  </button>
                                  <input 
                                    type="text" 
                                    value={opt.text}
                                    onChange={e => {
                                      const newOpts = [...options];
                                      newOpts[idx].text = e.target.value;
                                      setOptions(newOpts);
                                    }}
                                    className="flex-1 border-4 border-black p-3 font-bold outline-none focus:bg-white text-black placeholder:text-black/40"
                                    placeholder={`Đáp án ${idx + 1}`}
                                  />
                                  {options.length > 2 && (
                                    <button 
                                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                      className="bg-rose-100 border-4 border-black p-2 hover:bg-rose-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                    >
                                       <Trash2 size={20} />
                                    </button>
                                  )}
                               </div>
                             ))}
                               <button 
                                 onClick={() => setOptions([...options, { text: '', isCorrect: false }])}
                                 className="text-xs font-black uppercase underline hover:text-emerald-600 transition-colors text-black"
                               >
                                 + Thêm lựa chọn
                               </button>
                          </div>
                       </div>

                       <div className="flex gap-4 pt-4">
                          <Button onClick={handleSaveQuestion} className="flex-1 bg-black text-white hover:bg-emerald-400 hover:text-black border-4 border-black h-16 text-xl">
                             <Save className="mr-2" /> {editingQuestion ? 'CẬP NHẬT' : 'LƯU CÂU HỎI'}
                          </Button>
                          <Button 
                             variant="outline"
                             onClick={() => setIsAddingQuestion(false)} 
                             className="text-black hover:bg-yellow-400 border-4 border-black w-32 h-16 font-black"
                           >
                              HỦY
                           </Button>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       {selectedBank.questions?.map((q: any, idx: number) => (
                         <div key={q.id} className="border-4 border-black p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-2">
                                      <span className="text-[10px] font-black bg-black text-white px-2 py-0.5">CÂU HỎI {idx + 1}</span>
                                      <span className={`text-[10px] font-black border-2 border-black px-2 py-0.5 ${
                                        q.difficulty === 'EASY' ? 'bg-emerald-400' : q.difficulty === 'MEDIUM' ? 'bg-yellow-400' : 'bg-rose-400'
                                      }`}>
                                        {q.difficulty || 'EASY'}
                                      </span>
                                   </div>
                                  <p className="text-xl font-bold text-black">{q.questionText}</p>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingQuestion(q);
                                      setQuestionText(q.questionText);
                                      setQuestionType('MCQ');
                                      setDifficulty(q.difficulty || 'EASY');
                                      setOptions(q.options.map((o: any) => ({ text: o.optionText, isCorrect: o.isCorrect })));
                                      setIsAddingQuestion(true);
                                    }}
                                    className="bg-yellow-300 border-2 border-black p-2 hover:translate-y-px shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="bg-rose-400 border-2 border-black p-2 hover:translate-y-px shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               {q.options?.map((opt: any) => (
                                 <div key={opt.id} className={`p-3 border-2 border-black flex items-center justify-between ${opt.isCorrect ? 'bg-emerald-100 border-emerald-600 border-[3px]' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="font-bold text-sm text-black">{opt.optionText}</span>
                                    {opt.isCorrect && <CheckCircle2 size={14} className="text-emerald-600" />}
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                      {selectedBank.questions?.length === 0 && (
                        <div className="text-center py-20 border-4 border-black border-dashed opacity-40">
                           <h5 className="font-black uppercase text-xl">Chưa có câu hỏi nào trong ngân hàng này</h5>
                           <p className="text-sm font-bold mt-2 italic">Hãy bắt đầu thêm câu hỏi để làm bài kiểm tra</p>
                        </div>
                      )}
                      
                      {isDetailLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                           <div className="flex flex-col items-center">
                              <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
                              <span className="font-black uppercase text-xs italic">Đang tải dữ liệu...</span>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-12 relative group">
                  <div className="w-32 h-32 bg-yellow-400 border-4 border-black flex items-center justify-center mb-6 rotate-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform">
                     <Edit3 size={64} className="text-black" />
                  </div>
                  <h3 className="text-3xl font-black uppercase text-black italic tracking-tighter leading-none mb-4">Chọn một ngân hàng câu hỏi</h3>
                  <p className="font-black italic text-black bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Hoặc tạo ngân hàng mới ở thanh bên trái để bắt đầu</p>
               </div>
             )}
          </div>
        </div>

        {/* Floating Help Button */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-none">
           {showGuide && (
             <div className="bg-black text-white p-6 border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] max-w-xs animate-in slide-in-from-bottom-4 pointer-events-auto">
                <div className="flex justify-between items-center mb-4 border-b border-white pb-2">
                   <span className="font-black uppercase tracking-widest text-[10px]">Hướng dẫn sử dụng</span>
                   <button onClick={() => setShowGuide(false)}><X size={14} /></button>
                </div>
                <ul className="text-xs font-bold space-y-3 italic">
                   <li className="flex gap-2">
                     <span className="text-emerald-400">1.</span>
                     <span>Tạo Ngân hàng: Nhấn (+) ở bên trái để theo nhóm chủ đề.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="text-emerald-400">2.</span>
                     <span>Thêm câu hỏi: Chọn ngân hàng và nhấn "THÊM CÂU HỎI".</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="text-emerald-400">3.</span>
                     <span>Đáp án: Nhấp vòng tròn để đánh dấu đáp án ĐÚNG.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="text-emerald-400">4.</span>
                     <span>Sử dụng: Quay lại trang Builder để nhập câu hỏi vào bài kiểm tra.</span>
                   </li>
                </ul>
             </div>
           )}
           <button 
             onClick={() => setShowGuide(!showGuide)}
             className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:bg-emerald-400 hover:text-black transition-all pointer-events-auto hover:scale-110 active:scale-95"
           >
             <span className="text-2xl font-black italic">!</span>
           </button>
        </div>
      </div>
    </div>
  );
}
