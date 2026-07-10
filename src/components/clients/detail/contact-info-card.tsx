import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Client } from '@/lib/types';
import { Mail, Phone, Copy, Check, Pencil, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ContactInfoCardProps {
  client: Client;
}

export function ContactInfoCard({ client }: ContactInfoCardProps) {
  const updateClient = useAppStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [notes, setNotes] = useState(client.notes);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    updateClient(client.id, { email, phone, notes });
    setEditing(false);
  };

  const handleCancel = () => {
    setEmail(client.email);
    setPhone(client.phone);
    setNotes(client.notes);
    setEditing(false);
  };

  // Tags
  const [tags, setTags] = useState(client.tags);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      updateClient(client.id, { tags: newTags });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    updateClient(client.id, { tags: newTags });
  };

  return (
    <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Contact Info</h3>
        {editing ? (
          <div className="flex gap-1">
            <button onClick={handleSave} className="text-[#6366f1] hover:text-[#5558e0]">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={handleCancel} className="text-white/40 hover:text-white/60">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Edit contact">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-white/40" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-8 px-2 rounded bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-white/40" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 h-8 px-2 rounded bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes..."
            rows={3}
            className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 resize-none"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/70 flex-1">{client.email}</span>
            <button
              onClick={() => handleCopy(client.email, 'email')}
              className="text-white/30 hover:text-white/60 transition-colors"
              aria-label="Copy email"
            >
              {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/70 flex-1">{client.phone || '—'}</span>
            {client.phone && (
              <button
                onClick={() => handleCopy(client.phone, 'phone')}
                className="text-white/30 hover:text-white/60 transition-colors"
                aria-label="Copy phone"
              >
                {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          {client.notes && (
            <p className="text-xs text-white/50 leading-relaxed">{client.notes}</p>
          )}
        </div>
      )}

      {/* Tags */}
      <div>
        <h4 className="text-xs text-white/50 mb-2">Tags</h4>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-white/60 border border-white/10"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="text-white/30 hover:text-red-400" aria-label={`Remove ${tag}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="+ Add tag"
              className="w-20 h-6 px-1.5 rounded bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none focus:bg-white/5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
