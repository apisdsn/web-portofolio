'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api, ApiError } from '@/lib/admin/client';
import type { Item, ResourceDef } from '@/lib/admin/resources';
import { EntityForm } from './EntityForm';
import { Button, Notice } from './ui';

type Editing = { mode: 'create' } | { mode: 'edit'; item: Item } | null;

function SortableRow({
  item,
  label,
  active,
  onEdit,
  onDelete,
}: {
  item: Item;
  label: string;
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id as number });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border bg-white px-3 py-2 ${
        active ? 'border-ink' : 'border-line'
      } ${isDragging ? 'z-10 shadow-lg' : ''}`}
    >
      <button
        type="button"
        aria-label={`Geser untuk mengurutkan: ${label}`}
        className="flex h-10 w-8 cursor-grab touch-none items-center justify-center text-muted hover:text-ink"
        {...attributes}
        {...listeners}
      >
        <svg aria-hidden="true" width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
          <circle cx="4" cy="4" r="1.6" />
          <circle cx="10" cy="4" r="1.6" />
          <circle cx="4" cy="10" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="4" cy="16" r="1.6" />
          <circle cx="10" cy="16" r="1.6" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label || '(tanpa judul)'}</span>
      {item.published === false ? (
        <span className="rounded bg-chip px-2 py-0.5 text-[11px] font-semibold text-muted">Draf</span>
      ) : null}
      <Button variant="secondary" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="danger" onClick={onDelete} aria-label={`Hapus ${label}`}>
        Hapus
      </Button>
    </li>
  );
}

export function ResourceManager({ resource }: { resource: ResourceDef }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    try {
      setItems(await api<Item[]>(resource.endpoint));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [resource.endpoint]);

  useEffect(() => {
    setLoading(true);
    setEditing(null);
    void load();
  }, [load]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    try {
      await api(`${resource.endpoint}/reorder`, { method: 'PUT', body: reordered.map((i) => i.id) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan urutan');
      void load();
    }
  }

  async function handleDelete(item: Item) {
    const label = resource.summary(item);
    if (!window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api(`${resource.endpoint}/${item.id}`, { method: 'DELETE' });
      if (editing?.mode === 'edit' && editing.item.id === item.id) setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal menghapus');
    }
  }

  async function handleSave(draft: Item) {
    if (editing?.mode === 'edit') {
      const saved = await api<Item>(`${resource.endpoint}/${editing.item.id}`, { method: 'PUT', body: draft });
      setEditing({ mode: 'edit', item: saved });
    } else {
      const saved = await api<Item>(resource.endpoint, { method: 'POST', body: draft });
      setEditing({ mode: 'edit', item: saved });
      setNotice('Data baru ditambahkan.');
    }
    await load();
  }

  const activeId = editing?.mode === 'edit' ? editing.item.id : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{resource.title}</h1>
          <p className="text-sm text-muted">Seret ikon ⋮⋮ untuk mengubah urutan tampil di website.</p>
        </div>
        <Button
          onClick={() => {
            setNotice(null);
            setEditing({ mode: 'create' });
          }}
        >
          + Tambah
        </Button>
      </div>

      {error ? <Notice kind="error">{error}</Notice> : null}
      {notice ? <Notice kind="success">{notice}</Notice> : null}

      {loading ? (
        <p className="text-sm text-muted">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Belum ada data.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id as number)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  label={resource.summary(item)}
                  active={item.id === activeId}
                  onEdit={() => {
                    setNotice(null);
                    setEditing({ mode: 'edit', item });
                  }}
                  onDelete={() => void handleDelete(item)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {editing ? (
        <section className="rounded-lg border border-line bg-ground p-6" aria-label="Editor">
          <h2 className="mb-5 text-lg font-semibold">
            {editing.mode === 'create' ? `Tambah ${resource.title.toLowerCase()}` : `Edit: ${resource.summary(editing.item)}`}
          </h2>
          <EntityForm
            key={editing.mode === 'edit' ? `edit-${editing.item.id}` : 'create'}
            fields={resource.fields}
            initial={editing.mode === 'edit' ? editing.item : resource.empty()}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : null}
    </div>
  );
}
