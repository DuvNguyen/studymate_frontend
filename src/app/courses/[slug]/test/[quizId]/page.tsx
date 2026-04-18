'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/Button';
import { 
  FileQuestion, 
  Clock, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Loader2,
  XCircle
} from 'lucide-react';

export default function QuizPlayerPage() {
  const { slug, quizId } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'RESULT'>('START');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchQuiz = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.data || data);
      } else {
        toast.error('Không tìm thấy bài kiểm tra');
        router.push(`/courses/${slug}/learn`);
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const attemptData = data.data || data;
        setAttempt(attemptData);
        setTimeRemaining(attemptData.quiz.timeLimit * 60);
        setStatus('PLAYING');
        startTimer();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Không thể bắt đầu làm bài');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        
        // Warnings
        if (prev === 300) toast('Còn 5 phút nữa!', { icon: '⚠️' });
        if (prev === 60) toast('Còn 1 phút nữa! Hệ thống sẽ tự nộp bài.', { icon: '🚨' });
        
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [optionId] // Current implementation only supports single choice for simplicity
    }));
  };

  const submitQuiz = async () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    performSubmit();
  };

  const handleAutoSubmit = () => {
    toast.error('Hết thời gian! Hệ thống đang tự động nộp bài.');
    performSubmit();
  };

  const performSubmit = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data.data || data);
        setStatus('RESULT');
      } else {
        toast.error('Lỗi khi nộp bài');
      }
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && status === 'START') {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  if (status === 'START') {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-20 px-4">
           <div className="bg-white border-8 border-black p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
              <div className="bg-yellow-400 p-6 border-4 border-black mb-8 rotate-3">
                 <FileQuestion size={64} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Examination Module</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">{quiz?.title}</h1>
              <p className="max-w-xl font-bold italic mb-12 text-gray-500">{quiz?.description || 'Hãy tập trung làm bài để đạt kết quả tốt nhất. Bài kiểm tra này được thiết kế để đánh giá kiến thức của bạn.'}</p>
              
              <div className="grid grid-cols-3 gap-8 w-full mb-12">
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center">
                    <Clock size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase">Thời gian</span>
                    <span className="text-2xl font-black uppercase italic">{quiz?.timeLimit} Phút</span>
                 </div>
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center">
                    <Target size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase">Điểm đạt</span>
                    <span className="text-2xl font-black uppercase italic">{quiz?.passingScore}%</span>
                 </div>
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center">
                    <Target size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase">Số câu</span>
                    <span className="text-2xl font-black uppercase italic">{quiz?.numQuestions} Câu</span>
                 </div>
              </div>

              <div className="flex gap-4 w-full max-w-lg">
                 <Button 
                   onClick={startQuiz}
                   className="flex-1 bg-black text-white hover:bg-emerald-400 hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-4 border-black h-20 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]"
                 >
                    BẮT ĐẦU LÀM BÀI <ArrowRight className="ml-2" />
                 </Button>
              </div>
              
              <button 
                onClick={() => router.back()}
                className="mt-8 text-xs font-black uppercase underline hover:text-rose-500 transition-colors"
              >
                Trở về khóa học
              </button>
           </div>
        </div>
      </MainLayout>
    );
  }

  if (status === 'RESULT') {
    const passed = result.passed;
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-20 px-4">
           <div className={`bg-white border-8 border-black p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center ${passed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <div className={`p-6 border-4 border-black mb-8 rotate-[-3deg] ${passed ? 'bg-emerald-400' : 'bg-rose-500'}`}>
                 {passed ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
              </div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
                {passed ? 'BÀN THẮNG RỰC RỠ!' : 'CHƯA ĐẠT KẾT QUẢ!'}
              </h2>
              <p className="text-xl font-black uppercase tracking-widest mb-12 opacity-80 italic">
                {passed ? 'BẠN ĐÃ VƯỢT QUA BÀI KIỂM TRA' : 'BẠN CẦN CỐ GẮNG HƠN LẦN SAU'}
              </p>

              <div className="grid grid-cols-2 gap-8 w-full mb-12 max-w-xl">
                 <div className="border-4 border-black p-8 bg-white flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase">Điểm của bạn</span>
                    <span className={`text-6xl font-black italic ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.round(result.score)}%</span>
                 </div>
                 <div className="border-4 border-black p-8 bg-white flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase">Kết quả chung</span>
                    <span className="text-4xl font-black uppercase italic mt-4">{passed ? 'ĐẠT' : 'TRƯỢT'}</span>
                 </div>
              </div>

              <div className="space-y-4 w-full max-w-lg">
                 <Button 
                   onClick={() => router.push(`/courses/${slug}/learn`)}
                   className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black border-4 border-black h-16 text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                 >
                    TRỞ LẠI KHÓA HỌC
                 </Button>
                 {!passed && quiz?.isFinal && (
                   <p className="text-xs font-bold italic text-rose-600">Lưu ý: Bạn còn cơ hội làm lại bài kiểm tra cuối khóa.</p>
                 )}
              </div>
           </div>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = attempt.questionSnapshots[activeQuestionIdx];
  const userSelected = answers[currentQuestion.id] || [];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans selection:bg-yellow-300">
      {/* Quiz Header */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-black text-white border-b-8 border-yellow-400 z-50 flex items-center justify-between px-8">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => { if(confirm('Hành động này sẽ làm bạn mất bài làm hiện tại. Chắc chắn?')) router.back(); }}
              className="bg-white text-black p-2 border-2 border-white hover:bg-rose-500 hover:text-white transition-all overflow-hidden rotate-[-5deg]"
            >
               <ArrowLeft size={24} />
            </button>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Examination in progress</p>
               <h1 className="text-2xl font-black uppercase italic leading-none">{quiz?.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className={`flex flex-col items-center border-4 border-white p-2 px-6 ${timeRemaining < 300 ? 'bg-rose-600 animate-pulse' : 'bg-black'}`}>
               <span className="text-[10px] font-black uppercase opacity-50 text-white">Remaining Time</span>
               <span className="text-2xl font-black tracking-tighter italic text-white flex items-center gap-2">
                 <Clock size={20} /> {formatTime(timeRemaining)}
               </span>
            </div>
            <Button 
              onClick={submitQuiz}
              disabled={isSubmitting}
              className="bg-emerald-400 text-black hover:bg-emerald-500 border-4 border-white h-16 px-10 text-xl font-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
            >
               {isSubmitting ? <Loader2 className="animate-spin" /> : <>NỘP BÀI <Send className="ml-2" size={20} /></>}
            </Button>
         </div>
      </header>

      <main className="flex-1 flex mt-24">
         {/* Navigation Sidebar */}
         <aside className="w-[350px] bg-white border-r-8 border-black p-8 sticky top-24 h-[calc(100vh-96px)] overflow-y-auto">
            <h3 className="font-black uppercase text-xs mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
               <Target size={16} /> Question Overview
            </h3>
            <div className="grid grid-cols-4 gap-3">
               {attempt.questionSnapshots.map((q: any, i: number) => {
                 const isAnswered = !!answers[q.id]?.length;
                 const isActive = activeQuestionIdx === i;
                 return (
                   <button
                     key={q.id}
                     onClick={() => setActiveQuestionIdx(i)}
                     className={`aspect-square border-4 border-black flex items-center justify-center font-black text-lg transition-all ${
                       isActive ? 'bg-yellow-400 translate-x-1 outline-none' : isAnswered ? 'bg-emerald-400' : 'bg-white hover:bg-gray-100 hover:translate-y-[-2px]'
                     } ${!isActive && !isAnswered ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                   >
                     {i + 1}
                   </button>
                 );
               })}
            </div>

            <div className="mt-12 p-6 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
               <p className="text-[10px] font-black uppercase mb-4 opacity-50 italic">Instructions</p>
               <ul className="text-xs font-bold space-y-3 list-none">
                  <li className="flex items-start gap-2">
                     <span className="shrink-0 text-yellow-400">⚡</span>
                     Bạn không thể quay lại làm bài sau khi hết thời gian.
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="shrink-0 text-yellow-400">⚡</span>
                     Hệ thống tự động lưu khi thời gian kết thúc.
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="shrink-0 text-yellow-400">⚡</span>
                     Hãy kiểm tra kỹ từng đáp án trước khi nhấn Nộp bài.
                  </li>
               </ul>
            </div>
         </aside>

         {/* Question Content */}
         <section className="flex-1 bg-white p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="bg-black text-white px-4 py-1 text-xs font-black uppercase italic skew-x-[-12deg]">
                        Question {activeQuestionIdx + 1} of {attempt.questionSnapshots.length}
                     </span>
                     {currentQuestion.questionType === 'MCQ' ? (
                       <span className="text-[10px] font-black border-2 border-black px-2 py-0.5">MULTIPLE_CHOICE</span>
                     ) : (
                       <span className="text-[10px] font-black border-2 border-black px-2 py-0.5">TRUE_FALSE</span>
                     )}
                  </div>
                  <h2 className="text-4xl font-black text-black leading-tight italic tracking-tighter decoration-yellow-400 decoration-8 underline-offset-8">
                     {currentQuestion.questionText}
                  </h2>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  {currentQuestion.options.map((opt: any) => {
                    const isSelected = userSelected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`w-full p-8 border-8 border-black text-left flex items-center justify-between group transition-all transform ${
                          isSelected ? 'bg-black text-white translate-x-4 shadow-none' : 'bg-white text-black hover:bg-yellow-50 hover:translate-x-2'
                        } ${!isSelected ? 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                      >
                         <span className="text-2xl font-black uppercase leading-none tracking-tight">
                           {opt.optionText}
                         </span>
                         <div className={`w-10 h-10 border-4 border-black flex items-center justify-center transition-all ${
                           isSelected ? 'bg-yellow-400 text-black rotate-12 scale-110' : 'bg-zinc-100 group-hover:bg-white'
                         }`}>
                            {isSelected && <CheckCircle2 size={32} strokeWidth={3} />}
                         </div>
                      </button>
                    );
                  })}
               </div>

               {/* Navigation Controls */}
               <div className="pt-12 border-t-8 border-black flex justify-between items-center bg-zinc-50 p-8">
                  <Button 
                    variant="outline"
                    disabled={activeQuestionIdx === 0}
                    onClick={() => setActiveQuestionIdx(idx => idx - 1)}
                    className="border-4 border-black h-16 w-16 p-0 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-white"
                  >
                     <ArrowLeft size={32} />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-black italic uppercase">Step {activeQuestionIdx + 1} / {attempt.questionSnapshots.length}</span>
                  </div>

                  {activeQuestionIdx < attempt.questionSnapshots.length - 1 ? (
                    <Button 
                      onClick={() => setActiveQuestionIdx(idx => idx + 1)}
                      className="bg-black text-white hover:bg-yellow-400 hover:text-black border-4 border-black h-16 px-12 text-xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] group"
                    >
                       PHÁT TIẾP <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={submitQuiz}
                      className="bg-rose-500 text-white hover:bg-rose-600 border-4 border-black h-16 px-12 text-xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                       HOÀN TẤT <Send className="ml-2" />
                    </Button>
                  )}
               </div>
            </div>
         </section>
      </main>
    </div>
  );
}
