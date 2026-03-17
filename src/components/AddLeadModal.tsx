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
  { key: 'category', label: 'Nicho' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'phone', label: 'Telefone' },
  { key: 'nome_decisor', label: 'Nome Decisor' },
  { key: 'numero_decisor', label: 'Número Decisor' },
  { key: 'responsavel', label: 'Pessoa Responsável' },
  { key: 'website', label: 'Website', full: true },
  { key: 'address', label: 'Endereço', full: true },
  { key: 'descricao', label: 'Descrição', full: true },
] as const;

export function AddLeadModal({ open, onClose, onAdd }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: form.name || '', title: '', category: form.category || '',
      address: form.address || '', city: form.city || '', state: form.state || '',
      phone: form.phone || '', website: form.website || '', google_maps_url: '',
      rating: '', reviews_count: '', instagram: '',
      responsavel: form.responsavel || '', descricao: form.descricao || '',
      status: 'none', whatsapp_group: '', meeting_dates: [],
      nome_decisor: form.nome_decisor || '', numero_decisor: form.numero_decisor || '',
    });
    setForm({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Adicionar Nova Empresa</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {fields.map(f => (
            <div key={f.key} className={'full' in f && f.full ? 'sm:col-span-2' : ''}>
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input className="h-11 text-sm mt-1 rounded-xl" value={form[f.key] || ''} onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <Button onClick={handleSubmit} className="w-full mt-4 h-12 rounded-xl text-base font-semibold">Adicionar Empresa</Button>
      </DialogContent>
    </Dialog>
  );
}
