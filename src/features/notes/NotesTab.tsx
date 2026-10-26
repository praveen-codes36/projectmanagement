import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../../api/services/notes';
import { Note } from '../../api/types';
import { usePermissions } from '../../auth/usePermissions';
import { UserRole } from '../../lib/constants';
import {
  Button,
  Dialog,
  Tooltip,
  EmptyState,
  Avatar,
} from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Shield,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export interface NotesTabProps {
  projectId: string;
  currentUserRole: UserRole;
}

export function NotesTab({ projectId, currentUserRole }: NotesTabProps) {
  const queryClient = useQueryClient();
  const permissions = usePermissions(currentUserRole);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const {
    data: notes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: () => notesService.getNotes(projectId),
    staleTime: 30 * 1000,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      if (editingNote) {
        return notesService.updateNote(projectId, editingNote.id, content);
      }
      return notesService.createNote(projectId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast.success(editingNote ? 'Field note updated.' : 'Field note published.');
      setEditorOpen(false);
      setEditingNote(null);
      setContent('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save note.');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => notesService.deleteNote(projectId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast.success('Field note deleted.');
      setNoteToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete note.');
    },
  });

  const handleOpenCreate = () => {
    setEditingNote(null);
    setContent('');
    setEditorOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setContent(note.content);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-text">Shared Field Notes</h2>
          <p className="text-xs text-text-muted">
            Project documentation, mission briefings, and team retrospective logs.
          </p>
        </div>

        <div>
          {permissions.canWriteNotes ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Note
            </Button>
          ) : (
            <Tooltip content={permissions.getPermissionReason('write_notes') || 'Admin role required'}>
              <Button
                variant="outline"
                size="sm"
                disabled
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Read Only
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-border rounded-md bg-surface space-y-2 animate-pulse">
              <div className="h-4 bg-surface-raised rounded w-1/3" />
              <div className="h-3 bg-surface-raised rounded w-full" />
              <div className="h-3 bg-surface-raised rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 border border-danger/20 rounded-md bg-danger/5 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs text-danger">{(error as any)?.message || 'Failed to load field notes.'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-primary" />}
          title="No field notes recorded"
          description="Maintain shared project context by drafting expedition logs, technical specs, or retro notes."
          actionLabel={permissions.canWriteNotes ? 'Draft First Note' : undefined}
          onAction={permissions.canWriteNotes ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className="p-5 border border-border rounded-md bg-surface space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Avatar nameOrEmail={note.author?.username || note.createdBy || 'Author'} size="xs" />
                  <span className="text-xs font-medium text-text">
                    {note.author?.username || 'Team Member'}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-text-muted font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(note.updatedAt || note.createdAt)}
                  </span>
                </div>

                {permissions.canWriteNotes && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(note)}
                      aria-label="Edit note"
                      className="p-1.5 text-text-muted hover:text-text rounded-xs hover:bg-surface-raised transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteToDelete(note)}
                      aria-label="Delete note"
                      className="p-1.5 text-text-muted hover:text-danger rounded-xs hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs text-text leading-relaxed whitespace-pre-wrap font-sans">
                {note.content}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Note Editor Dialog */}
      <Dialog
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingNote ? 'Edit Field Note' : 'Draft New Field Note'}
        description="Share architectural specifications, route briefings, or retrospective summaries."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditorOpen(false)}
              disabled={saveNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={saveNoteMutation.isPending}
              disabled={!content.trim()}
              onClick={() => saveNoteMutation.mutate()}
            >
              {editingNote ? 'Update Note' : 'Publish Note'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            autoFocus
            rows={8}
            placeholder="Document field findings, meeting minutes, or expedition requirements..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-xs bg-surface text-text rounded-sm border border-border placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-accent resize-y font-sans leading-relaxed"
          />
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        title="Delete Field Note"
        description="Are you sure you want to permanently remove this note from the expedition records? This action cannot be reversed."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNoteToDelete(null)}
              disabled={deleteNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteNoteMutation.isPending}
              onClick={() => {
                if (noteToDelete) {
                  deleteNoteMutation.mutate(noteToDelete.id);
                }
              }}
            >
              Delete Note
            </Button>
          </>
        }
      >
        <p className="text-xs text-text-muted italic bg-surface-raised p-3 rounded-xs line-clamp-3">
          "{noteToDelete?.content}"
        </p>
      </Dialog>
    </div>
  );
}
