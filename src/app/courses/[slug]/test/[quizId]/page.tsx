'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Target, 
  CheckCircle2, 
  FileQuestion, 
  Trophy, 
  AlertTriangle, 
  RotateCcw, 
  Eye, 
  Send,
  Loader2,
  X,
  History
} from 'lucide-react';

function AttemptHistoryModal({ attempts, onClose }: { attempts: any[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 hover:rotate-90 transition-transform text-black">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-black uppercase italic mb-8 border-b-8 border-black pb-4 text-black tracking-tighter flex items-center gap-3">
          <History size={32} /> LỊCH SỬ LÀM BÀI
        </h2>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full border-4 border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 text-left font-black uppercase text-xs">Ngày làm</th>
                <th className="p-4 text-center font-black uppercase text-xs">Điểm số</th>
                <th className="p-4 text-center font-black uppercase text-xs">Kết quả</th>
              </tr>
            </thead>
            <tbody className="font-bold text-black border-4 border-black">
              {attempts.map((att) => (
                <tr key={att.id} className="border-b-4 border-black hover:bg-yellow-50 transition-colors">
                  <td className="p-4 text-sm">{new Date(att.completedAt || att.startedAt).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-center text-xl font-black">{Math.round(att.score)}%</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 border-2 border-black text-[10px] font-black uppercase ${att.isPassed ? 'bg-emerald-400' : 'bg-rose-500'}`}>
                      {att.isPassed ? 'ĐẠT' : 'TRƯỢT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attempts.length === 0 && (
            <div className="p-12 text-center font-black uppercase italic opacity-30 text-black">Chưa có dữ liệu làm bài</div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={onClose} className="bg-black text-white hover:bg-rose-500 border-4 border-black px-8 h-12">ĐÓNG</Button>
        </div>
      </div>
    </div>
  );
}

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
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'RESULT'>('START');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuiz();
    fetchPastAttempts();
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

  const fetchPastAttempts = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        setPastAttempts(list);
      }
    } catch (e) {
      console.error('Lỗi khi tải lịch sử:', e);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/quizzes/${quizId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        const attemptData = data.data || data;
        setAttempt(attemptData);
        setTimeRemaining(attemptData.quiz.timeLimit * 60);
        setStatus('PLAYING');
        startTimer();
      } else {
        toast.error(data.message || 'Không thể bắt đầu làm bài');
      }
    } catch (e: any) {
      toast.error('Lỗi kết nối: ' + (e.message || 'vui lòng thử lại'));
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
      [questionId]: [optionId]
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
        fetchPastAttempts();
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
           <div className="bg-white border-8 border-black p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="bg-yellow-400 p-6 border-4 border-black mb-8 rotate-3">
                 <FileQuestion size={64} color="black" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 text-black">Examination Module</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 text-black">{quiz?.title}</h1>
              <p className="max-w-xl font-bold italic mb-12 text-gray-500">{quiz?.description || 'Hãy tập trung làm bài để đạt kết quả tốt nhất.'}</p>
              
              <div className="grid grid-cols-3 gap-8 w-full mb-12">
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Clock size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Thời gian</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.timeLimit} Phút</span>
                 </div>
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Target size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Điểm đạt</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.passingScore}%</span>
                 </div>
                 <div className="border-4 border-black p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Target size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Số câu</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.numQuestions} Câu</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-lg">
                 <Button 
                   onClick={startQuiz}
                   className="w-full bg-black text-white hover:bg-emerald-400 hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-4 border-black h-20 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]"
                 >
                    BẮT ĐẦU LÀM BÀI <ArrowRight className="ml-2" />
                 </Button>

                 {pastAttempts.length > 0 && (
                   <div className="flex items-center gap-0 w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      <button 
                        onClick={() => setShowHistory(true)}
                        className="flex-1 h-16 text-lg font-black uppercase text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 border-r-4 border-black"
                      >
                         <History size={20} /> XEM LỊCH SỬ
                      </button>
                      <div className="px-6 h-16 flex items-center justify-center bg-black text-white font-black italic">
                         {pastAttempts.length} LẦN
                      </div>
                   </div>
                 )}
              </div>
              
              <button 
                onClick={() => router.back()}
                className="mt-8 text-xs font-black uppercase underline hover:text-rose-500 transition-colors text-black"
              >
                Trở về khóa học
              </button>
           </div>
        </div>
        {showHistory && <AttemptHistoryModal attempts={pastAttempts} onClose={() => setShowHistory(false)} />}
      </MainLayout>
    );
  }

  if (status === 'RESULT') {
    const passed = result.passed || result.isPassed;
    const correctAnswers = result.correctAnswers || {};
    
    if (showReview) {
      return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans selection:bg-yellow-300">
          <header className="fixed top-0 left-0 right-0 h-20 bg-black text-white border-b-8 border-emerald-400 z-50 flex items-center justify-between px-8">
             <div className="flex items-center gap-6">
                <button onClick={() => setShowReview(false)} className="bg-white text-black p-2 border-2 border-black hover:bg-rose-500 hover:text-white transition-all">
                   <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-black uppercase italic">REVIEW: {quiz?.title}</h1>
             </div>
             <div className="bg-white text-black px-6 py-2 border-4 border-black font-black italic">
                {Math.round(result.score)}% - {passed ? 'PASSED' : 'FAILED'}
             </div>
          </header>
          <main className="flex-1 flex mt-20">
             <aside className="w-[300px] bg-white border-r-8 border-black p-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
                <div className="grid grid-cols-4 gap-3">
                   {attempt.questionSnapshots.map((q: any, i: number) => {
                     const isUserCorrect = (answers[q.id]?.[0] || null) === (correctAnswers[q.id] || null);
                     return (
                       <button
                         key={q.id}
                         onClick={() => setActiveQuestionIdx(i)}
                         className={`aspect-square border-4 border-black flex items-center justify-center font-black text-lg transition-all ${
                           activeQuestionIdx === i ? 'ring-4 ring-black ring-offset-2' : ''
                         } ${isUserCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`}
                       >
                         {i + 1}
                       </button>
                     );
                   })}
                </div>
             </aside>
             <section className="flex-1 bg-white p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                   <h2 className="text-2xl font-black text-black">{attempt.questionSnapshots[activeQuestionIdx].text}</h2>
                   <div className="grid grid-cols-1 gap-4">
                      {attempt.questionSnapshots[activeQuestionIdx].options.map((opt: any) => {
                        const isSelected = (answers[attempt.questionSnapshots[activeQuestionIdx].id]?.[0] || null) === opt.id;
                        const isCorrect = (correctAnswers[attempt.questionSnapshots[activeQuestionIdx].id] || null) === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`p-5 border-4 border-black flex items-center justify-between font-black uppercase ${
                              isCorrect ? 'bg-emerald-100 border-emerald-600' : isSelected ? 'bg-rose-100 border-rose-600' : 'bg-white'
                            }`}
                          >
                             <span>{opt.text}</span>
                             {isCorrect && <CheckCircle2 className="text-emerald-600" />}
                             {isSelected && !isCorrect && <X className="text-rose-600" />}
                          </div>
                        );
                      })}
                   </div>
                   <div className="pt-8 border-t-4 border-black flex justify-between">
                      <Button variant="outline" disabled={activeQuestionIdx === 0} onClick={() => setActiveQuestionIdx(i => i - 1)}>TRƯỚC</Button>
                      <Button variant="outline" disabled={activeQuestionIdx === attempt.questionSnapshots.length - 1} onClick={() => setActiveQuestionIdx(i => i + 1)}>TIẾP THEO</Button>
                   </div>
                </div>
             </section>
          </main>
        </div>
      );
    }

    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-20 px-4">
           <div className="bg-white border-8 border-black p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
              <div className={`p-6 border-4 border-black mb-8 rotate-3 ${passed ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                 {passed ? <Trophy size={64} /> : <AlertTriangle size={64} />}
              </div>
              
              <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2 text-black">
                {passed ? 'XUẤT SẮC!' : 'CỐ GẮNG HƠN!'}
              </h1>
              <p className="text-xl font-bold mb-12 text-black">Bạn đã hoàn thành bài kiểm tra "{quiz?.title}"</p>
              
              <div className="flex flex-col items-center bg-zinc-100 border-4 border-black p-10 mb-12 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Final Score</p>
                 <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black italic ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.round(result.score)}%</span>
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
         <aside className="w-[300px] bg-white border-r-8 border-black p-6 sticky top-24 h-[calc(100vh-96px)] overflow-y-auto">
            <h3 className="font-black uppercase text-xs mb-6 flex items-center gap-2 border-b-2 border-black pb-2 text-black">
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
                       isActive ? 'bg-yellow-400 translate-x-1 outline-none text-black' : isAnswered ? 'bg-emerald-400 text-black' : 'bg-white hover:bg-gray-100 hover:translate-y-[-2px] text-black'
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
                       <span className="text-[10px] font-black border-2 border-black px-2 py-0.5 text-black">MULTIPLE_CHOICE</span>
                     ) : (
                       <span className="text-[10px] font-black border-2 border-black px-2 py-0.5 text-black">TRUE_FALSE</span>
                     )}
                  </div>
                  <h2 className="text-2xl font-black text-black leading-tight italic tracking-tighter decoration-yellow-400 decoration-8 underline-offset-8">
                     {currentQuestion.text}
                  </h2>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  {currentQuestion.options.map((opt: any) => {
                    const isSelected = userSelected.includes(opt.id);
                    return (
                       <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`w-full p-5 border-4 border-black text-left flex items-center justify-between group transition-all transform ${
                          isSelected ? 'bg-black text-white translate-x-2 shadow-none' : 'bg-white text-black hover:bg-yellow-50 hover:translate-x-1'
                        } ${!isSelected ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                      >
                         <span className="text-lg font-black uppercase leading-none tracking-tight">
                           {opt.text}
                         </span>
                         <div className={`w-8 h-8 border-2 border-black flex items-center justify-center transition-all ${
                           isSelected ? 'bg-yellow-400 text-black rotate-12 scale-110' : 'bg-zinc-100 group-hover:bg-white'
                         }`}>
                            {isSelected && <CheckCircle2 size={24} strokeWidth={3} />}
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
                    className="border-4 border-black h-16 w-16 p-0 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-white text-black"
                  >
                     <ArrowLeft size={32} />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-black italic uppercase text-black">Step {activeQuestionIdx + 1} / {attempt.questionSnapshots.length}</span>
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
