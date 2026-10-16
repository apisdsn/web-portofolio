'use client';

/* eslint-disable @next/next/no-img-element -- previews of uploaded media */
import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { api, ApiError } from '@/lib/admin/client';
import { mediaUrl, type Media } from '@/lib/types';
import { Button, FieldShell } from './ui';

const OUTPUT_SIZE = 640;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gambar tidak bisa dibaca'));
    img.src = src;
  });
}

async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak tersedia');
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) =>
    // Browsers without WebP encoding fall back to PNG, which the API also accepts.
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses gambar'))), 'image/webp', 0.9),
  );
}

interface Props {
  label: string;
  error?: string;
  value: string | null | undefined;
  onChange: (mediaId: string | null) => void;
}

/** Pick a photo, crop it to a circle, and upload the square result. */
export function ImageCropUpload({ label, error, value, onChange }: Props) {
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source);
  }, [source]);

  const current = mediaUrl(value);

  async function save() {
    if (!source || !area) return;
    setBusy(true);
    setUploadError(null);
    try {
      const blob = await cropToBlob(source, area);
      const form = new FormData();
      form.append('file', blob, blob.type === 'image/webp' ? 'avatar.webp' : 'avatar.png');
      const media = await api<Media>('/admin/media', { method: 'POST', formData: form });
      onChange(media.id);
      setSource(null);
    } catch (e) {
      setUploadError(e instanceof ApiError || e instanceof Error ? e.message : 'Upload gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <FieldShell label={label} error={error ?? uploadError ?? undefined} help="JPEG, PNG, atau WebP, maks. 5 MB. Hasil crop disimpan 640×640 px.">
      <div className="flex flex-wrap items-center gap-4">
        {current ? (
          <img src={current} alt="Foto profil saat ini" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-chip text-xs text-muted">Belum ada</div>
        )}
        <label className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-ink">
          Pilih foto baru
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setZoom(1);
                setCrop({ x: 0, y: 0 });
                setSource(URL.createObjectURL(file));
              }
              e.target.value = '';
            }}
          />
        </label>
        {value ? (
          <Button variant="ghost" onClick={() => onChange(null)}>
            Hapus foto
          </Button>
        ) : null}
      </div>

      {source ? (
        <div className="mt-3 flex flex-col gap-3 rounded-md border border-line bg-white p-4">
          <div className="relative h-[320px] w-full overflow-hidden rounded-md bg-ink">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            Zoom
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={save} disabled={busy || !area}>
              {busy ? 'Mengunggah…' : 'Simpan crop'}
            </Button>
            <Button variant="secondary" onClick={() => setSource(null)} disabled={busy}>
              Batal
            </Button>
          </div>
          <p className="text-xs text-muted">Setelah upload, klik &quot;Simpan perubahan&quot; di bawah agar foto dipakai di website.</p>
        </div>
      ) : null}
    </FieldShell>
  );
}
