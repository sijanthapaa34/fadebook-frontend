import { useState } from 'react';
import type { ReviewDTO } from '@/models/models';
import StarRating from './StarRating';
import { UserCircle, Trash2, Pencil, Reply, Send, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewCardProps {
  review: ReviewDTO;
  isOwn?: boolean;
  canReply?: boolean;
  onEdit?: (review: ReviewDTO) => void;
  onDelete?: (id: string) => void;
  onReply?: (message: string) => void;
}

const ReviewCard = ({ review, isOwn, canReply, onEdit, onDelete, onReply }: ReviewCardProps) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply?.(replyText.trim());
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UserCircle size={22} />
          </div>
          <div>
            <p className="text-sm font-medium">{review.customerName || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>

      {/* FIX: Display the comment here, not the reply */}
      <p className="text-sm text-foreground/90 leading-relaxed">{review.reply}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.images.map((img, i) => (
            <div key={i} className="w-20 h-20 rounded-md bg-muted border border-border overflow-hidden">
              <img src={img} alt="Review" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Barber/Shop Reply (If exists) */}
      {review.reply && (
        <div className="ml-6 pl-4 border-l-2 border-primary/30 space-y-2 bg-muted/20 p-3 rounded-r-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Scissors size={12} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary">Shop Response</p>
          </div>
          <p className="text-sm text-foreground/80">{review.reply}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {isOwn && (
          <>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => onEdit?.(review)}>
              <Pencil size={12} className="mr-1" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => onDelete?.(String(review.id))}>
              <Trash2 size={12} className="mr-1" /> Delete
            </Button>
          </>
        )}
        {canReply && !review.reply && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setShowReplyBox(!showReplyBox)}>
            <Reply size={12} className="mr-1" /> Reply
          </Button>
        )}
      </div>

      {/* Reply input */}
      {showReplyBox && (
        <div className="ml-6 space-y-2 pt-2">
          <Textarea
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[60px] text-sm bg-muted/30"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setShowReplyBox(false); setReplyText(''); }}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={handleSubmitReply} disabled={!replyText.trim()}>
              <Send size={12} className="mr-1" /> Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;