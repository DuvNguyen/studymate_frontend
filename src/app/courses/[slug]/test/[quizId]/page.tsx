'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Eye, 
  Send,
  Loader2,
  X,
  History
} from 'lucide-react';

interface QuizOption {
  id: number;
  text: string;
}

interface QuestionSnapshot {
  id: number;
  text: string;
  questionType: 'MCQ' | 'TF';
  options: QuizOption[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  numQuestions: number;
  isFinal?: boolean;
}

interface QuizAttempt {
  id: number;
  score: number;
  isPassed: boolean;
  passed?: boolean;
  completedAt?: string;
  startedAt: string;
  quiz: Quiz;
  questionSnapshots: QuestionSnapshot[];
  answers: Record<number, number[]>;
  correctAnswers?: Record<number, number>;
}

function AttemptHistoryModal({ attempts, onClose, onReview }: {
  attempts: QuizAttempt[];
  onClose: () => void;
  onReview: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border-4 border-black p-4 sm:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 hover:rotate-90 transition-transform text-black">
          <X size={24} />
        </button>
        <h2 className="text-xl sm:text-3xl font-black uppercase italic mb-6 sm:mb-8 border-b-8 border-black pb-4 text-black tracking-tighter flex items-center gap-3">
          <History size={32} /> LỊCH SỬ LÀM BÀI
        </h2>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="min-w-[640px] w-full border-4 border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 text-left font-black uppercase text-xs">Ngày làm</th>
                <th className="p-4 text-center font-black uppercase text-xs">Điểm số</th>
                <th className="p-4 text-center font-black uppercase text-xs">Kết quả</th>
                <th className="p-4 text-center font-black uppercase text-xs">Xem</th>
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
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onReview(att.id)}
                      title="Xem lại bài làm"
                      className="group bg-yellow-400 text-black p-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:rotate-12"
                    >
                       <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attempts.length === 0 && (
            <div className="p-12 text-center font-black uppercase italic opacity-30 text-black">Chưa có dữ liệu làm bài</div>
          )}
        </div>
        
        <div className="mt-6 sm:mt-8 flex justify-end">
          <Button onClick={onClose} className="bg-black text-white hover:bg-rose-500 border-4 border-black px-8 h-12">ĐÓNG</Button>
        </div>
      </div>
    </div>
  );
}

export default function QuizPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const quizId = params.quizId as string;
  const { getToken } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'RESULT'>('START');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.data || data);
      } else {
        toast.error('Không tìm thấy bài kiểm tra');
        router.push(`/courses/${slug}/learn`);
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [getToken, quizId, slug, router]);

  const fetchPastAttempts = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        setPastAttempts(list);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử:', err);
    }
  }, [getToken, quizId]);

  useEffect(() => {
    fetchQuiz();
    fetchPastAttempts();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchQuiz, fetchPastAttempts]);

  const handleHistoryReview = async (id: number) => {
    setShowHistory(false);
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/attempts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const detail = data.data || data;
        
        setAttempt(detail);
        setAnswers(detail.answers || {});
        setResult(detail);
        setStatus('RESULT');
        setShowReview(true);
        setActiveQuestionIdx(0);
      } else {
        toast.error('Không thể tải chi tiết bài làm');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const performSubmit = useCallback(async () => {
    if (!attempt) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/attempts/${attempt.id}/submit`, {
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
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt, answers, getToken, fetchPastAttempts]);

  const handleAutoSubmit = useCallback(() => {
    toast.error('Hết thời gian! Hệ thống đang tự động nộp bài.');
    performSubmit();
  }, [performSubmit]);

  const submitQuiz = async () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    performSubmit();
  };

  const startTimer = useCallback(() => {
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
  }, [handleAutoSubmit]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/start`, {
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
    } catch (e) {
      toast.error('Lỗi kết nối: ' + (e instanceof Error ? e.message : 'vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-4xl mx-auto py-8 sm:py-12 md:py-20 px-3 sm:px-4">
           <div className="bg-white border-4 sm:border-8 border-black p-5 sm:p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="bg-yellow-400 p-4 sm:p-6 border-4 border-black mb-6 sm:mb-8 rotate-3">
                 <FileQuestion size={64} color="black" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 text-black">Examination Module</p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-black">{quiz?.title}</h1>
              <p className="max-w-xl font-bold italic mb-6 sm:mb-10 md:mb-12 text-gray-500 text-sm sm:text-base">{quiz?.description || 'Hãy tập trung làm bài để đạt kết quả tốt nhất.'}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full mb-8 sm:mb-12">
                 <div className="border-4 border-black p-4 sm:p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Clock size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Thời gian</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.timeLimit} Phút</span>
                 </div>
                 <div className="border-4 border-black p-4 sm:p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Target size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Điểm đạt</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.passingScore}%</span>
                 </div>
                 <div className="border-4 border-black p-4 sm:p-6 bg-gray-50 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Target size={32} className="mb-2 text-black" />
                    <span className="text-[10px] font-black uppercase text-black">Số câu</span>
                    <span className="text-2xl font-black uppercase italic text-black">{quiz?.numQuestions} Câu</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-lg">
                 <Button 
                   onClick={startQuiz}
                   className="w-full bg-black text-white hover:bg-emerald-400 hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-4 border-black h-14 sm:h-20 text-base sm:text-2xl font-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]"
                 >
                    BẮT ĐẦU LÀM BÀI <ArrowRight className="ml-2" />
                 </Button>

                 {pastAttempts.length > 0 && (
                    <div className="flex items-center gap-0 w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                       <button 
                         onClick={() => setShowHistory(true)}
                         className="flex-1 h-14 sm:h-16 text-sm sm:text-lg font-black uppercase text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 border-r-4 border-black"
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
                className="mt-6 sm:mt-8 text-xs font-black uppercase underline hover:text-rose-500 transition-colors text-black"
              >
                Trở về khóa học
              </button>
           </div>
        </div>
        {showHistory && (
           <AttemptHistoryModal 
             attempts={pastAttempts} 
             onClose={() => setShowHistory(false)} 
             onReview={handleHistoryReview}
           />
         )}
      </MainLayout>
    );
  }

  if (status === 'RESULT' && result && attempt) {
    const passed = result.passed || result.isPassed;
    const correctAnswers = result.correctAnswers || {};
    
    if (showReview) {
      return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans selection:bg-yellow-300">
          <header className="fixed top-0 left-0 right-0 h-16 sm:h-20 bg-black text-white border-b-4 sm:border-b-8 border-emerald-400 z-50 flex items-center justify-between px-3 sm:px-8">
             <div className="flex items-center gap-6">
                <button onClick={() => setShowReview(false)} className="bg-white text-black p-2 border-2 border-black hover:bg-rose-500 hover:text-white transition-all">
                   <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm sm:text-xl font-black uppercase italic truncate max-w-[60vw] sm:max-w-none">REVIEW: {quiz?.title}</h1>
             </div>
             <div className="bg-white text-black px-3 sm:px-6 py-2 border-2 sm:border-4 border-black font-black italic text-xs sm:text-base">
                {Math.round(result.score)}% - {passed ? 'PASSED' : 'FAILED'}
             </div>
          </header>
          <main className="flex-1 flex flex-col lg:flex-row mt-16 sm:mt-20">
             <aside className="w-full lg:w-[300px] bg-white lg:border-r-8 border-black p-3 sm:p-6 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto">
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-4 gap-2 sm:gap-3">
                   {attempt.questionSnapshots.map((q, i) => {
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
             <section className="flex-1 bg-white p-4 sm:p-8 md:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                   <h2 className="text-lg sm:text-2xl font-black text-black">{attempt.questionSnapshots[activeQuestionIdx].text}</h2>
                   <div className="grid grid-cols-1 gap-4">
                      {attempt.questionSnapshots[activeQuestionIdx].options.map((opt) => {
                        const isSelected = (answers[attempt.questionSnapshots[activeQuestionIdx].id]?.[0] || null) === opt.id;
                        const isCorrect = (correctAnswers[attempt.questionSnapshots[activeQuestionIdx].id] || null) === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`p-4 sm:p-5 border-4 border-black flex items-center justify-between font-black uppercase text-sm sm:text-base ${
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
        <div className="max-w-4xl mx-auto py-8 sm:py-12 md:py-20 px-3 sm:px-4">
           <div className="bg-white border-4 sm:border-8 border-black p-5 sm:p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
              <div className={`p-6 border-4 border-black mb-8 rotate-3 ${passed ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                 {passed ? <Trophy size={64} /> : <AlertTriangle size={64} />}
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mb-2 text-black">
                {passed ? 'XUẤT SẮC!' : 'CỐ GẮNG HƠN!'}
              </h1>
              <p className="text-base sm:text-xl font-bold mb-8 sm:mb-12 text-black">Bạn đã hoàn thành bài kiểm tra &quot;{quiz?.title}&quot;</p>
              
              <div className="flex flex-col items-center bg-zinc-100 border-4 border-black p-10 mb-12 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Final Score</p>
                 <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black italic ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.round(result.score)}%</span>
                 </div>
              </div>

              <div className="space-y-4 w-full max-w-lg">
                 <Button 
                   onClick={() => setShowReview(true)}
                    className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white border-4 border-black h-12 sm:h-16 text-sm sm:text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                 >
                    <Eye size={24} /> XEM ĐÁP ÁN CHI TIẾT
                 </Button>

                 <Button 
                   onClick={() => router.push(`/courses/${slug}/learn`)}
                   variant="outline"
                   className="w-full bg-white text-black hover:bg-gray-100 border-4 border-black h-12 sm:h-16 text-sm sm:text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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

  if (attempt) {
    const currentQuestion = attempt.questionSnapshots[activeQuestionIdx];
    const userSelected = answers[currentQuestion.id] || [];

    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col font-sans selection:bg-yellow-300">
        {/* Quiz Header */}
        <header className="fixed top-0 left-0 right-0 h-[76px] sm:h-24 bg-black text-white border-b-4 sm:border-b-8 border-yellow-400 z-50 flex items-center justify-between px-3 sm:px-8 gap-2">
           <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1">
              <button 
                onClick={() => { if(confirm('Hành động này sẽ làm bạn mất bài làm hiện tại. Chắc chắn?')) router.back(); }}
                className="bg-white text-black p-2 border-2 border-white hover:bg-rose-500 hover:text-white transition-all overflow-hidden rotate-[-5deg]"
              >
                 <ArrowLeft size={24} />
              </button>
              <div className="min-w-0">
                 <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.14em] opacity-60 truncate">Examination in progress</p>
                 <h1 className="text-[13px] sm:text-2xl font-black uppercase italic leading-none truncate max-w-[40vw] sm:max-w-none">{quiz?.title}</h1>
              </div>
           </div>

           <div className="flex items-center gap-2 sm:gap-8 flex-shrink-0">
              <div className={`flex flex-col items-center border-2 sm:border-4 border-white py-1 px-2 sm:p-2 sm:px-6 ${timeRemaining < 300 ? 'bg-rose-600 animate-pulse' : 'bg-black'}`}>
                 <span className="text-[8px] sm:text-[10px] font-black uppercase opacity-50 text-white">Time</span>
                 <span className="text-[13px] sm:text-2xl font-black tracking-tight italic text-white flex items-center gap-1 sm:gap-2">
                   <Clock size={16} className="sm:w-5 sm:h-5" /> {formatTime(timeRemaining)}
                 </span>
              </div>
              <Button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="bg-emerald-400 text-black hover:bg-emerald-500 border-2 sm:border-4 border-white h-10 sm:h-16 px-3 sm:px-10 text-xs sm:text-xl font-black tracking-wide shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
              >
                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>NỘP <Send className="ml-1 sm:ml-2 sm:w-5 sm:h-5" size={16} /></>}
              </Button>
           </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row mt-[76px] sm:mt-24">
           {/* Navigation Sidebar */}
           <aside className="w-full lg:w-[300px] bg-white lg:border-r-8 border-black p-3 sm:p-6 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] overflow-y-auto">
              <h3 className="font-black uppercase text-[11px] mb-4 flex items-center gap-2 border-b-2 border-black pb-2 text-black">
                 <Target size={16} /> Question Overview
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                 {attempt.questionSnapshots.map((q, i) => {
                   const isAnswered = !!answers[q.id]?.length;
                   const isActive = activeQuestionIdx === i;
                   return (
                     <button
                       key={q.id}
                       onClick={() => setActiveQuestionIdx(i)}
                       className={`aspect-square border-4 border-black flex items-center justify-center font-black text-base sm:text-lg transition-all ${
                         isActive ? 'bg-yellow-400 translate-x-1 outline-none text-black' : isAnswered ? 'bg-emerald-400 text-black' : 'bg-white hover:bg-gray-100 hover:translate-y-[-2px] text-black'
                       } ${!isActive && !isAnswered ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                     >
                       {i + 1}
                     </button>
                   );
                 })}
              </div>

              <div className="mt-5 sm:mt-10 p-4 sm:p-5 bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
                 <p className="text-[10px] font-black uppercase mb-4 opacity-50 italic">Instructions</p>
                 <ul className="text-[13px] sm:text-xs font-bold space-y-2.5 list-none">
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
           <section className="flex-1 bg-white p-4 sm:p-8 md:p-12 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-5 sm:space-y-12">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                       <span className="bg-black text-white px-3 py-1 text-[10px] sm:text-xs font-black uppercase italic skew-x-[-12deg]">
                          Question {activeQuestionIdx + 1} of {attempt.questionSnapshots.length}
                       </span>
                       {currentQuestion.questionType === 'MCQ' ? (
                         <span className="text-[10px] font-black border-2 border-black px-2 py-0.5 text-black">MULTIPLE_CHOICE</span>
                       ) : (
                         <span className="text-[10px] font-black border-2 border-black px-2 py-0.5 text-black">TRUE_FALSE</span>
                       )}
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-black leading-snug italic tracking-tight sm:tracking-tighter decoration-yellow-400 decoration-8 underline-offset-8">
                       {currentQuestion.text}
                    </h2>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = userSelected.includes(opt.id);
                      return (
                         <button
                          key={opt.id}
                          onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                          className={`w-full p-3 sm:p-5 border-4 border-black text-left flex items-center justify-between group transition-all transform ${
                            isSelected ? 'bg-black text-white translate-x-2 shadow-none' : 'bg-white text-black hover:bg-yellow-50 hover:translate-x-1'
                          } ${!isSelected ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                        >
                           <span className="text-sm sm:text-lg font-black uppercase leading-none tracking-tight pr-3">
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
                 <div className="pt-4 sm:pt-12 border-t-8 border-black flex flex-wrap sm:flex-nowrap justify-between items-center bg-zinc-50 p-3 sm:p-8 gap-2 sm:gap-3">
                    <Button 
                      variant="outline"
                      disabled={activeQuestionIdx === 0}
                      onClick={() => setActiveQuestionIdx(idx => idx - 1)}
                      className="border-4 border-black h-12 w-12 sm:h-16 sm:w-16 p-0 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-white text-black"
                    >
                       <ArrowLeft size={32} />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                       <span className="text-xs sm:text-sm font-black italic uppercase text-black">Step {activeQuestionIdx + 1} / {attempt.questionSnapshots.length}</span>
                    </div>

                    {activeQuestionIdx < attempt.questionSnapshots.length - 1 ? (
                      <Button 
                        onClick={() => setActiveQuestionIdx(idx => idx + 1)}
                      className="bg-black text-white hover:bg-yellow-400 hover:text-black border-4 border-black h-12 sm:h-16 px-4 sm:px-12 text-sm sm:text-xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] group flex-1 sm:flex-none"
                      >
                         PHÁT TIẾP <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={submitQuiz}
                        className="bg-rose-500 text-white hover:bg-rose-600 border-4 border-black h-12 sm:h-16 px-4 sm:px-12 text-sm sm:text-xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 sm:flex-none"
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

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Loader2 className="w-12 h-12 animate-spin text-black" />
    </div>
  );
}
