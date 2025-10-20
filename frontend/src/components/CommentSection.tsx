import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Edit2, Trash2, Send } from 'lucide-react';
import api from '../lib/api';
import { Comment, CommentType, ReactionType } from '../types/comment';
import { useAuthStore } from '../store/authStore';
import { formatRelativeTime } from '../lib/utils';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  entityType: CommentType;
  entityId: string;
}

export default function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/comments/${entityType}/${entityId}`);
      setComments(response.data.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Sie müssen angemeldet sein');
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 3) {
      toast.error('Kommentar muss mindestens 3 Zeichen lang sein');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/comments', {
        entityType,
        entityId,
        content: newComment.trim(),
      });
      setNewComment('');
      toast.success('Kommentar wurde hinzugefügt');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erstellen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || editContent.trim().length < 3) {
      toast.error('Kommentar muss mindestens 3 Zeichen lang sein');
      return;
    }

    try {
      await api.put(`/api/comments/${commentId}`, {
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent('');
      toast.success('Kommentar wurde aktualisiert');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Aktualisieren');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      return;
    }

    try {
      await api.delete(`/api/comments/${commentId}`);
      toast.success('Kommentar wurde gelöscht');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Löschen');
    }
  };

  const handleReaction = async (commentId: string, reactionType: ReactionType) => {
    if (!isAuthenticated) {
      toast.error('Sie müssen angemeldet sein');
      return;
    }

    try {
      await api.post(`/api/comments/reactions/comment/${commentId}`, {
        reactionType,
      });
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Lädt Kommentare...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-oedp-orange text-white flex items-center justify-center font-bold">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Schreiben Sie einen Kommentar..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oedp-orange focus:border-transparent resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newComment.length}/1000 Zeichen
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="btn btn-primary"
                >
                  <Send size={16} className="mr-2" />
                  {submitting ? 'Wird gesendet...' : 'Kommentieren'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card text-center py-6">
          <p className="text-gray-600">
            <a href="/login" className="text-oedp-orange hover:underline">Melden Sie sich an</a>, um zu kommentieren
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">
          {comments.length} Kommentar{comments.length !== 1 ? 'e' : ''}
        </h3>

        {comments.length === 0 ? (
          <div className="card text-center py-8">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Noch keine Kommentare</p>
            <p className="text-sm text-gray-400">Seien Sie der Erste, der kommentiert!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold flex-shrink-0">
                  {comment.author.firstName[0]}{comment.author.lastName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Author & Time */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bold text-gray-900">
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.createdAt)}
                      {comment.isEdited && ' (bearbeitet)'}
                    </span>
                  </div>

                  {/* Content */}
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oedp-orange focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    {/* Like/Dislike */}
                    <button
                      onClick={() => handleReaction(comment.id, ReactionType.LIKE)}
                      className={`flex items-center gap-1 text-sm transition ${
                        comment.userReaction === ReactionType.LIKE
                          ? 'text-oedp-orange font-bold'
                          : 'text-gray-600 hover:text-oedp-orange'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp size={16} />
                      <span>{comment.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, ReactionType.DISLIKE)}
                      className={`flex items-center gap-1 text-sm transition ${
                        comment.userReaction === ReactionType.DISLIKE
                          ? 'text-red-600 font-bold'
                          : 'text-gray-600 hover:text-red-600'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsDown size={16} />
                      <span>{comment.dislikesCount || 0}</span>
                    </button>

                    {/* Edit/Delete for own comments */}
                    {user?.id === comment.authorId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-oedp-orange transition"
                        >
                          <Edit2 size={14} />
                          <span>Bearbeiten</span>
                        </button>

                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 size={14} />
                          <span>Löschen</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
