'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { X, Save, Clock, Target, ListChecks } from 'lucide-react';
import { Button } from '@/components/Button';

interface QuizSettingsModalProps {
  courseId: number;
  sectionId: number | null;
  quiz: any; // Existing quiz if editing
  onClose: () => void;
  onSaved: () => void;
}

export default function QuizSettingsModal({ courseId, sectionId, quiz, onClose, onSaved }: QuizSettingsModalProps) {
  const { getToken } = useAuth();
  const [banks, setBanks] = useState<any[]>([]);
  const [title, setTitle] = useState(quiz?.title || (sectionId ? 'BÀI KIỂM TRA CHƯƠNG' : 'BÀI KIỂM TRA CUỐI KHÓA'));
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 80);
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit || 30);
  const [numQuestions, setNumQuestions] = useState(quiz?.numQuestions || 10);
  const [bankId, setBankId] = useState<number | ''>(quiz?.bankId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
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
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Vui lòng nhập tiêu đề');
    if (!bankId) return toast.error('Vui lòng chọn ngân hàng câu hỏi');

    setLoading(true);
    try {
      const token = await getToken();
      const url = quiz ? `http://localhost:3001/api/v1/instructor/quizzes/${quiz.id}` : `http://localhost:3001/api/v1/instructor/quizzes`;
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
    } catch (e) {
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
        
        <h2 className="text-2xl font-black uppercase italic mb-6 border-b-4 border-black pb-4">CÀI ĐẶT BÀI KIỂM TRA</h2>
        
        <div className="space-y-6">
           <div>
              <label className="block text-[10px] font-black uppercase mb-1">Tiêu đề bài kiểm tra</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border-4 border-black p-3 font-bold bg-zinc-50 outline-none focus:bg-yellow-50"
              />
           </div>

           <div>
              <label className="block text-[10px] font-black uppercase mb-1">Chọn Ngân hàng câu hỏi</label>
              <select 
                value={bankId}
                onChange={e => setBankId(Number(e.target.value))}
                className="w-full border-4 border-black p-3 font-bold bg-zinc-50 outline-none"
              >
                 <option value="" disabled>-- CHỌN NGÂN HÀNG --</option>
                 {banks.map(bank => (
                   <option key={bank.id} value={bank.id}>{bank.name.toUpperCase()}</option>
                 ))}
              </select>
              {banks.length === 0 && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase italic">Bạn chưa có ngân hàng nào cho khóa học này!</p>}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-1">
                   <Clock size={14} /> Thời gian (phút)
                 </label>
                 <input 
                   type="number" 
                   value={timeLimit}
                   onChange={e => setTimeLimit(Number(e.target.value))}
                   className="w-full border-4 border-black p-3 font-bold outline-none"
                 />
              </div>
              <div>
                 <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-1">
                   <ListChecks size={14} /> Số câu hỏi
                 </label>
                 <input 
                   type="number" 
                   value={numQuestions}
                   onChange={e => setNumQuestions(Number(e.target.value))}
                   className="w-full border-4 border-black p-3 font-bold outline-none"
                 />
              </div>
           </div>

           <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-1">
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
                <span className="w-16 border-4 border-black p-2 text-center font-black bg-yellow-400">{passingScore}%</span>
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
