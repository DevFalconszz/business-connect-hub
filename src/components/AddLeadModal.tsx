import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lead } from '@/lib/types';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}

const fields = [
  { key: 'name', label: 'Nome *', required: true },
  { key: 'title', label: 'Título' },
  { key: 'category', label: 'Categoria' },
  { key: 'address', label: 'Endereço' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'phone', label: 'Telefone' },
  { key: 'website', label: 'Website' },
  { key: 'google_maps_url', label: 'Google Maps URL' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviews_count', label: 'Nº Avaliações' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'responsavel', label: 'Pessoa Responsável' },
  { key: 'descricao', label: 'Descrição' },
] as const;

export function AddLeadModal({ open, onClose, onAdd }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: form.name || '',
      title: form.title || '',
      category: form.category || '',
      address: form.address || '',
      city: form.city || '',
      state: form.state || '',
      phone: form.phone || '',
      website: form.website || '',
      google_maps_url: form.google_maps_url || '',
      rating: form.rating || '',
      reviews_count: form.reviews_count || '',
      instagram: form.instagram || '',
      responsavel: form.responsavel || '',
      descricao: form.descricao || '',
      status: 'none',
      whatsapp_group: '',
      meeting_dates: [],
    });
    setForm({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Empresa</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {fields.map(f => (
            <div key={f.key} className={f.key === 'address' || f.key === 'google_maps_url' || f.key === 'descricao' ? 'col-span-2' : ''}>
              <Label className="text-xs">{f.label}</Label>
              <Input
                className="h-8 text-sm"
                value={form[f.key] || ''}
                onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSubmit} className="w-full mt-3">Adicionar</Button>
      </DialogContent>
    </Dialog>
  );
}
