'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { X, Save, Clock, Target, ListChecks } from 'lucide-react';
import { Button } from '@/components/Button';

interface QuizSettingsModalProps {
  courseId: number;
  sectionId: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz: any; // Existing quiz if editing
  onClose: () => void;
  onSaved: () => void;
}

export default function QuizSettingsModal({ courseId, sectionId, quiz, onClose, onSaved }: QuizSettingsModalProps) {
  const { getToken } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [banks, setBanks] = useState<any[]>([]);
  const [title, setTitle] = useState(quiz?.title || (sectionId ? 'BÀI KIỂM TRA CHƯƠNG' : 'BÀI KIỂM TRA CUỐI KHÓA'));
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 80);
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit || 30);
  const [numQuestions, setNumQuestions] = useState(quiz?.numQuestions || 10);
  const [bankId, setBankId] = useState<number | ''>(quiz?.bankId || '');
  const [difficulty, setDifficulty] = useState<string>(quiz?.difficulty || '');
  const [difficultyMode, setDifficultyMode] = useState<'random' | 'custom'>(
    (quiz?.numEasy || quiz?.numMedium || quiz?.numHard) ? 'custom' : 'random'
  );
  const [numEasy, setNumEasy] = useState(quiz?.numEasy || 0);
  const [numMedium, setNumMedium] = useState(quiz?.numMedium || 0);
  const [numHard, setNumHard] = useState(quiz?.numHard || 0);
  const [loading, setLoading] = useState(false);

  const fetchBanks = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructor/courses/${courseId}/question-banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanks(data.data || data);
      }
    } catch {
      toast.error('Lỗi khi tải ngân hàng câu hỏi');
    }
  }, [courseId, getToken]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Vui lòng nhập tiêu đề');
    if (!bankId) return toast.error('Vui lòng chọn ngân hàng câu hỏi');

    if (difficultyMode === 'custom') {
      const total = numEasy + numMedium + numHard;
      if (total !== numQuestions) {
        return toast.error(`Tổng số câu (${total}) phải bằng số lượng câu hỏi đã thiết lập (${numQuestions})`);
      }
    }

    setLoading(true);
    try {
      const token = await getToken();
      const url = quiz ? `${process.env.NEXT_PUBLIC_API_URL}/instructor/quizzes/${quiz.id}` : `${process.env.NEXT_PUBLIC_API_URL}/instructor/quizzes`;
      const method = quiz ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          courseId,
          sectionId,
          bankId,
          difficulty: difficultyMode === 'random' ? (difficulty || null) : null,
          numEasy: difficultyMode === 'custom' ? numEasy : 0,
          numMedium: difficultyMode === 'custom' ? numMedium : 0,
          numHard: difficultyMode === 'custom' ? numHard : 0,
          passingScore,
          timeLimit,
          numQuestions,
          isFinal: sectionId === null,
        })
      });

      if (res.ok) {
        toast.success('Đã lưu bài kiểm tra');
        onSaved();
        onClose();
      }
    } catch {
      toast.error('Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 hover:rotate-90 transition-transform">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-black uppercase italic mb-8 border-b-8 border-black pb-4 text-black tracking-tighter">CÀI ĐẶT BÀI KIỂM TRA</h2>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
           <div>
              <label className="block text-xs font-black uppercase mb-2 text-black">Tiêu đề bài kiểm tra</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                 className="w-full border-4 border-black p-4 font-black text-black text-xl outline-none bg-white focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
           </div>

           <div>
              <label className="block text-xs font-black uppercase mb-2 text-black">Chọn Ngân hàng câu hỏi</label>
              <select 
                value={bankId}
                onChange={e => setBankId(Number(e.target.value))}
                className="w-full border-4 border-black p-4 font-black bg-white outline-none text-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                 <option value="" disabled>-- CHỌN NGÂN HÀNG --</option>
                 {banks.map(bank => (
                   <option key={bank.id} value={bank.id}>{(bank.title || bank.name || 'KHÔNG TÊN').toUpperCase()}</option>
                 ))}
              </select>
              {banks.length === 0 && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase italic">Bạn chưa có ngân hàng nào cho khóa học này!</p>}
           </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase mb-2 text-black">
                    <Clock size={14} /> Thời gian (phút)
                  </label>
                  <input 
                    type="number" 
                    value={timeLimit}
                    onChange={e => setTimeLimit(Number(e.target.value))}
                    className="w-full border-4 border-black p-4 font-black text-black text-xl outline-none bg-white focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
               </div>
               <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase mb-2 text-black">
                    <ListChecks size={14} /> Tổng số câu
                  </label>
                  <input 
                    type="number" 
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full border-4 border-black p-4 font-black text-black text-xl outline-none bg-white focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
               </div>
            </div>

            <div className="p-5 border-4 border-black bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-black uppercase text-black">Cấu hình Độ khó</label>
                  <div className="flex bg-white border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                     <button 
                       type="button"
                       onClick={() => setDifficultyMode('random')}
                       className={`px-3 py-1 text-[10px] font-black uppercase transition-colors ${difficultyMode === 'random' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}
                     >
                        Ngẫu nhiên
                     </button>
                     <button 
                       type="button"
                       onClick={() => setDifficultyMode('custom')}
                       className={`px-3 py-1 text-[10px] font-black uppercase transition-colors ${difficultyMode === 'custom' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}
                     >
                        Tùy chọn
                     </button>
                  </div>
               </div>

               {difficultyMode === 'random' ? (
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full border-4 border-black p-3 font-black bg-white outline-none text-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                     <option value="">-- KHÔNG ƯU TIÊN --</option>
                     <option value="EASY">CHỈ LẤY CÂU DỄ</option>
                     <option value="MEDIUM">CHỈ LẤY CÂU TRUNG BÌNH</option>
                     <option value="HARD">CHỈ LẤY CÂU KHÓ</option>
                  </select>
               ) : (
                  <div className="flex items-center gap-3">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                           <span className="text-[10px] font-black uppercase">Dễ</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={numEasy}
                          onChange={e => setNumEasy(Number(e.target.value))}
                          className="w-full border-2 border-black p-2 font-black text-center text-lg outline-none focus:bg-emerald-50"
                        />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                           <span className="text-[10px] font-black uppercase">Vừa</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={numMedium}
                          onChange={e => setNumMedium(Number(e.target.value))}
                          className="w-full border-2 border-black p-2 font-black text-center text-lg outline-none focus:bg-yellow-50"
                        />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                           <span className="text-[10px] font-black uppercase">Khó</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={numHard}
                          onChange={e => setNumHard(Number(e.target.value))}
                          className="w-full border-2 border-black p-2 font-black text-center text-lg outline-none focus:bg-rose-50"
                        />
                     </div>
                  </div>
               )}
               
               {difficultyMode === 'custom' && (
                  <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
                     <span className="text-[10px] font-black uppercase opacity-60 italic">Phát hành: {numEasy + numMedium + numHard} / {numQuestions} câu</span>
                     <div className="flex gap-1 h-2 flex-1 mx-4 bg-gray-200 border border-black overflow-hidden rounded-full">
                        <div style={{ width: `${(numEasy / numQuestions) * 100}%` }} className="bg-emerald-500 h-full"></div>
                        <div style={{ width: `${(numMedium / numQuestions) * 100}%` }} className="bg-yellow-500 h-full"></div>
                        <div style={{ width: `${(numHard / numQuestions) * 100}%` }} className="bg-rose-500 h-full"></div>
                     </div>
                     <span className={`text-xs font-black uppercase italic ${numEasy + numMedium + numHard === numQuestions ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {numEasy + numMedium + numHard === numQuestions ? 'OK ✓' : 'LỖI ✗'}
                     </span>
                  </div>
               )}
            </div>

           <div>
              <label className="block text-xs font-black uppercase mb-2 text-black transition-colors">
                <Target size={14} /> Điểm đạt (%)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={passingScore}
                  onChange={e => setPassingScore(Number(e.target.value))}
                  className="flex-1 accent-black h-2 bg-gray-200"
                />
                <span className="w-24 border-4 border-black p-4 text-center font-black bg-yellow-400 text-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{passingScore}%</span>
              </div>
           </div>

           <div className="pt-4 flex gap-4">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-black text-white hover:bg-emerald-400 hover:text-black border-4 border-black h-16 text-lg"
              >
                 <Save className="mr-2" /> {loading ? 'ĐANG LƯU...' : 'LƯU CÀI ĐẶT'}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
