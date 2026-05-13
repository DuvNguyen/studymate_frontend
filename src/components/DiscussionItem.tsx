'use client';

import { useState } from 'react';
import { 
  Award, 
  Trash2, 
  Pencil, 
  ArrowBigUp, 
  ArrowBigDown, 
} from 'lucide-react';
import { Discussion } from '@/hooks/useDiscussions';
import { Button } from './Button';

interface DiscussionItemProps {
  discussion: Discussion;
  onMarkBest: (id: number) => void;
  onVote: (id: number, value: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onReply: (content: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any;
  level?: number;
}

export function DiscussionItem({ 
  discussion, 
  onMarkBest,
  onVote,
  onDelete,
  onUpdate,
  onReply, 
  currentUser,
  level = 0 
}: DiscussionItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(discussion.content);

  if (discussion.is_deleted) {
    return (
      <div className={`mt-2 mb-4 italic text-[11px] font-black text-black/40 border-l-4 border-black/10 pl-6 py-2 animate-in fade-in ${level > 0 ? 'ml-12' : ''}`}>
        Bình luận đã bị xóa
      </div>
    );
  }

  return (
    <div className={`space-y-4 animate-in slide-in-from-left-2 duration-300 ${level > 0 ? 'ml-12 border-l-4 border-black/10 pl-6 mt-4' : ''}`}>
      <div className="flex gap-4 group">
        <div className="flex-shrink-0">
           <div className="w-10 h-10 bg-black border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative">
              {discussion.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={discussion.user.avatarUrl} alt={discussion.user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-yellow-400 flex items-center justify-center font-black text-[10px] italic">USER</div>
              )}
              {discussion.is_best_answer && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-400 border border-black p-0.5 rounded-full">
                  <Award size={10} />
                </div>
              )}
           </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className={`relative inline-block max-w-full md:max-w-[90%] px-5 py-3 rounded-2xl transition-all ${discussion.is_best_answer ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-1 pr-12">
              <span className="text-xs font-black text-black uppercase tracking-tight truncate">
                {discussion.user.fullName || 'ANONYMOUS'}
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.5 bg-black text-white rounded-sm uppercase shrink-0">
                {discussion.user.role?.roleName || 'STUDENT'}
              </span>
              {discussion.is_edited && (
                <span className="text-[8px] font-black text-emerald-600 uppercase italic shrink-0"> (ĐÃ SỬA)</span>
              )}
            </div>

            <div className="text-sm font-bold text-black leading-relaxed whitespace-pre-line">
              {isEditing ? (
                <div className="space-y-3 mt-2 min-w-[200px] md:min-w-[400px]">
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 p-3 border-2 border-black font-black text-xs text-black focus:outline-none focus:bg-gray-50 resize-none rounded-lg"
                  />
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase underline">Hủy</button>
                    <button 
                      onClick={async () => {
                        await onUpdate(discussion.id, editContent);
                        setIsEditing(false);
                      }}
                      className="text-[10px] font-black uppercase text-emerald-600 underline"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                discussion.content
              )}
            </div>

            <div className="absolute top-2 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-lg p-1.5 min-h-[30px] items-center">
               {!discussion.is_deleted && (currentUser?.id === discussion.user.id || ['ADMIN', 'STAFF', 'INSTRUCTOR'].includes(currentUser?.role?.roleName || '')) && (
                  <>
                    {currentUser?.id === discussion.user.id && !isEditing && (
                      <button onClick={() => { setIsEditing(true); setEditContent(discussion.content); }} className="hover:text-amber-600 transition-colors"><Pencil size={12} /></button>
                    )}
                    <button onClick={() => onDelete(discussion.id)} className="hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                  </>
               )}
            </div>
          </div>

          {!discussion.is_deleted && (
            <div className="flex items-center gap-4 mt-2 ml-2">
              <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">
                {new Date(discussion.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={`text-[10px] font-black uppercase tracking-tight hover:underline transition-colors ${showReplyForm ? 'text-black' : 'text-black/60'}`}
              >
                Trả lời
              </button>

              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1 border border-black/20">
                <button 
                  onClick={() => onVote(discussion.id, discussion.userVote === 1 ? 0 : 1)}
                  className={`p-0.5 hover:bg-black/10 rounded-full transition-colors ${discussion.userVote === 1 ? 'text-emerald-600' : 'text-black/60'}`}
                >
                  <ArrowBigUp size={14} className={discussion.userVote === 1 ? 'fill-emerald-600' : ''} />
                </button>
                <span className="text-[10px] font-black min-w-[12px] text-center">
                  {discussion.upvotes - discussion.downvotes}
                </span>
                <button 
                  onClick={() => onVote(discussion.id, discussion.userVote === -1 ? 0 : -1)}
                  className={`p-0.5 hover:bg-black/10 rounded-full transition-colors ${discussion.userVote === -1 ? 'text-red-600' : 'text-black/60'}`}
                >
                  <ArrowBigDown size={14} className={discussion.userVote === -1 ? 'fill-red-600' : ''} />
                </button>
              </div>
              
              {currentUser?.role?.roleName === 'INSTRUCTOR' && (
                <button 
                  onClick={() => onMarkBest(discussion.id)}
                  className={`text-[10px] font-black uppercase tracking-tight hover:underline transition-colors ${discussion.is_best_answer ? 'text-emerald-600' : 'text-black/60'}`}
                >
                  {discussion.is_best_answer ? '★ Đã đánh dấu hữu ích' : 'Đánh dấu hữu ích'}
                </button>
              )}
            </div>
          )}
          
          {showReplyForm && (
            <div className="mt-4 border-l-4 border-black pl-4 py-2 animate-in slide-in-from-top-2">
              <textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhập phản hồi..."
                className="w-full h-24 p-4 border-2 border-black font-bold text-xs text-black focus:outline-none focus:bg-yellow-50 mb-3 resize-none rounded-xl"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowReplyForm(false)} className="text-[10px] font-black uppercase underline">Hủy</button>
                <Button 
                  size="sm"
                  onClick={async () => {
                    if (!replyContent.trim()) return;
                    await onReply(replyContent);
                    setReplyContent('');
                    setShowReplyForm(false);
                  }}
                  disabled={!replyContent.trim()}
                  className="!h-9 !px-6 text-[10px]"
                >
                  GỬI PHẢN HỒI
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {discussion.children && discussion.children.length > 0 && (
        <div className="space-y-4">
          {discussion.children.map((child) => (
            <DiscussionItem 
              key={child.id} 
              discussion={child} 
              onMarkBest={onMarkBest} 
              onVote={onVote}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply} 
              currentUser={currentUser}
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
