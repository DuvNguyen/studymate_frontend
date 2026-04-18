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

  // Question editing state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
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
          questionType,
          options: options.map(o => ({ optionText: o.text, isCorrect: o.isCorrect }))
        })
      });

      if (res.ok) {
        toast.success(editingQuestion ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi');
        setIsAddingQuestion(false);
        setEditingQuestion(null);
        setQuestionText('');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
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
           <h2 className="text-3xl font-black uppercase tracking-tighter italic">Quản lý Ngân hàng câu hỏi</h2>
           <button onClick={onClose} className="bg-white border-4 border-black p-2 hover:bg-black hover:text-white transition-all">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Banks List */}
          <div className="w-80 border-r-4 border-black overflow-y-auto p-4 space-y-4 bg-gray-50">
             <div className="flex justify-between items-center mb-4">
                <span className="font-black uppercase text-xs">Danh sách Ngân hàng</span>
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
               {banks.map(bank => (
                 <button
                   key={bank.id}
                   onClick={() => fetchBankDetail(bank.id)}
                   className={`w-full text-left p-3 border-2 border-black font-black uppercase text-sm transition-all ${
                     selectedBank?.id === bank.id ? 'bg-black text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                   }`}
                 >
                   {bank.name}
                 </button>
               ))}
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
                        <h3 className="text-2xl font-black uppercase">{selectedBank.name}</h3>
                     </div>
                     {!isAddingQuestion && (
                       <Button 
                         onClick={() => {
                           setIsAddingQuestion(true);
                           setEditingQuestion(null);
                           setQuestionText('');
                           setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
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
                                <label className="block text-xs font-black uppercase mb-1">Loại câu hỏi</label>
                                <select 
                                  value={questionType}
                                  onChange={e => setQuestionType(e.target.value)}
                                  className="w-full border-4 border-black p-3 font-black outline-none"
                                >
                                   <option value="MCQ">Trắc nghiệm (MCQ)</option>
                                   <option value="TRUE_FALSE">Đúng / Sai</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-black uppercase mb-1">Điểm số</label>
                                <input type="number" defaultValue="1" disabled className="w-full border-4 border-black p-3 font-black bg-gray-100 italic" title="Mặc định 1 điểm" />
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="block text-xs font-black uppercase mb-1">Các lựa chọn đáp án</label>
                             {options.map((opt, idx) => (
                               <div key={idx} className="flex gap-3">
                                  <button 
                                    onClick={() => {
                                      const newOpts = [...options];
                                      if (questionType === 'TRUE_FALSE') {
                                        newOpts.forEach((o, i) => o.isCorrect = i === idx);
                                      } else {
                                        newOpts[idx].isCorrect = !newOpts[idx].isCorrect;
                                      }
                                      setOptions(newOpts);
                                    }}
                                    className={`w-12 h-12 flex items-center justify-center border-4 border-black transition-all ${opt.isCorrect ? 'bg-emerald-400 shadow-none translate-y-px' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                                  >
                                     {opt.isCorrect ? <CheckCircle2 /> : <Circle />}
                                  </button>
                                  <input 
                                    type="text" 
                                    value={opt.text}
                                    onChange={e => {
                                      const newOpts = [...options];
                                      newOpts[idx].text = e.target.value;
                                      setOptions(newOpts);
                                    }}
                                    className="flex-1 border-4 border-black p-3 font-bold outline-none focus:bg-white"
                                    placeholder={`Đáp án ${idx + 1}`}
                                  />
                                  {options.length > 2 && (
                                    <button 
                                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                      className="bg-rose-100 border-4 border-black p-2 hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                       <Trash2 size={20} />
                                    </button>
                                  )}
                               </div>
                             ))}
                             {questionType === 'MCQ' && (
                               <button 
                                 onClick={() => setOptions([...options, { text: '', isCorrect: false }])}
                                 className="text-xs font-black uppercase underline hover:text-emerald-600 transition-colors"
                               >
                                 + Thêm lựa chọn
                               </button>
                             )}
                          </div>
                       </div>

                       <div className="flex gap-4 pt-4">
                          <Button onClick={handleSaveQuestion} className="flex-1 bg-black text-white hover:bg-emerald-400 hover:text-black border-4 border-black h-16 text-xl">
                             <Save className="mr-2" /> {editingQuestion ? 'CẬP NHẬT' : 'LƯU CÂU HỎI'}
                          </Button>
                          <Button onClick={() => setIsAddingQuestion(false)} className="bg-white text-black hover:bg-gray-100 border-4 border-black w-32 h-16">
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
                                  <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 mb-2 inline-block">CÂU HỎI {idx + 1}</span>
                                  <p className="text-xl font-bold text-black">{q.questionText}</p>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingQuestion(q);
                                      setQuestionText(q.questionText);
                                      setQuestionType(q.questionType);
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
                                 <div key={opt.id} className={`p-3 border-2 border-black flex items-center justify-between ${opt.isCorrect ? 'bg-emerald-100 border-emerald-600 border-[3px]' : 'bg-white opacity-60'}`}>
                                    <span className="font-bold text-sm">{opt.optionText}</span>
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
                    </div>
                  )}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Edit3 size={64} className="mb-4" />
                  <h3 className="text-2xl font-black uppercase">Chọn một ngân hàng câu hỏi để bắt đầu</h3>
                  <p className="font-bold italic mt-2">Hoặc tạo ngân hàng mới ở thanh bên trái</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
