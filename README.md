# web-portofolio

Website portofolio pribadi Hafiz Adha Febrian (bilingual ID/EN) dengan dashboard admin. Seluruh konten — profil, foto, status, case study, pengalaman, proyek, keahlian, pendidikan, sertifikasi, CV — diubah dari dashboard tanpa menyentuh kode.

## Arsitektur

```
Browser ──► Caddy (HTTPS)
             ├── /api/*  ──► api  (Spring Boot 3, Java 21) ──► PostgreSQL 16
             └── /*      ──► web  (Next.js 14, App Router)
                               ▲
   api ── POST /internal/revalidate ┘  (setelah setiap perubahan di admin)
```

| Bagian | Teknologi |
|---|---|
| `api/` | Spring Boot 3.3, Spring Security (JWT di cookie httpOnly), Spring Data JPA, Flyway, PostgreSQL JSONB, springdoc-openapi, Testcontainers |
| `web/` | Next.js 14, TypeScript, Tailwind CSS, react-markdown, dnd-kit, react-easy-crop |
| Infra | Docker Compose, Caddy (HTTPS otomatis), backup harian `pg_dump`, GitHub Actions CI |

### Keputusan desain

- **Teks bilingual disimpan sebagai JSONB** `{"id": "...", "en": "..."}` per kolom. Menambah bahasa baru tidak perlu migrasi skema, dan admin bisa melihat kolom yang belum diterjemahkan.
- **Halaman publik di-cache** (`unstable_cache` dengan tag `site`). Setelah transaksi admin *commit*, API memanggil `/internal/revalidate` sehingga perubahan langsung tampil tanpa rebuild.
- **Autentikasi**: satu akun admin, password BCrypt (cost 12), JWT di cookie `httpOnly` + `SameSite=Lax`, header wajib `X-Requested-With: portfolio-admin` untuk request yang mengubah data (pertahanan CSRF), dan rate limit login 5 kali gagal per 15 menit per IP.
- **Upload file** divalidasi dari *magic bytes* (JPEG, PNG, WebP, PDF), bukan dari nama atau `Content-Type` kiriman browser. Maksimal 5 MB, nama file di disk berupa UUID.
- **Audit log**: setiap create/update/delete/reorder disimpan dengan isi *sebelum* dan *sesudah* (JSONB), bisa dilihat di dashboard.

## Menjalankan secara lokal

Prasyarat: Docker dengan Docker Compose.

```bash
cp .env.example .env
# isi POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD (min. 12 karakter)
# JWT_SECRET dan REVALIDATE_SECRET: openssl rand -base64 48
docker compose up --build
```

- Website: http://localhost:3000
- Dashboard admin: http://localhost:3000/admin
- Dokumentasi API (Swagger): http://localhost:8080/api/docs

Saat pertama kali jalan, Flyway mengisi database dengan konten portofolio awal dan foto profil, lalu akun admin dibuat dari `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### Tanpa Docker (untuk development)

```bash
# Terminal 1 — PostgreSQL lokal sudah berjalan dengan database "portfolio"
cd api
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=password-min-12-char REVALIDATE_SECRET=dev-secret mvn spring-boot:run

# Terminal 2
cd web
npm install
REVALIDATE_SECRET=dev-secret npm run dev
```

## Deploy di server MoniShield (setup produksi saat ini)

Portfolio berbagi server dengan MoniShield (RAM < 2 GB):

- **PostgreSQL**: memakai container `postgres` milik MoniShield, dengan database dan role `portfolio` sendiri. Role ini tidak bisa membuka database `monishield`.
- **HTTPS**: Caddy milik MoniShield (profile `https`) melayani domain portfolio juga; portfolio tidak menjalankan Caddy sendiri sehingga tidak berebut port 80/443.
- **Image** dibuild di GitHub Actions dan disimpan di `ghcr.io`; server hanya `docker compose pull`. Build Maven/Next.js di server < 2 GB hampir pasti kehabisan memori.
- Batas memori: api 512 MB, web 256 MB, backup 64 MB.

Alur otomatis setiap push ke `master`: test → build & push image → SSH ke server → `deploy/remote-deploy.sh`.

### Setup sekali di awal

1. **Secrets repo** (Settings → Secrets and variables → Actions), nilainya sama dengan di repo MoniShield:
   `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, dan opsional `DEPLOY_PORT`.
   Folder tujuan default `/srv/web-portofolio` (ubah lewat *variable* `DEPLOY_DIR`).
2. **Di server**, sebagai user deploy:
   ```bash
   sudo mkdir -p /srv/web-portofolio && sudo chown "$USER": /srv/web-portofolio
   cd /srv/web-portofolio
   # salin isi deploy/.env.server.example ke .env lalu isi semua nilainya
   nano .env && chmod 600 .env
   ```
3. **DNS**: buat record A untuk `PORTFOLIO_DOMAIN` ke IP server.
4. **Caddy MoniShield**: tambahkan blok dari `deploy/Caddyfile.portfolio` ke `deploy/Caddyfile.letsencrypt` di repo MoniShield (ganti domainnya), commit, lalu deploy MoniShield seperti biasa. Edit langsung di server akan hilang karena deploy MoniShield menjalankan `git reset --hard`.
5. Jalankan workflow CI (push ke `master` atau tombol *Run workflow*).

`remote-deploy.sh` otomatis membuat role dan database `portfolio` di PostgreSQL MoniShield jika belum ada, lalu Flyway membuat tabel dan konten awal saat api pertama kali start.

### Backup

- Database: service `db-backup` menyimpan `pg_dump` harian ke `/srv/web-portofolio/backups` (default 7 hari).
- File upload (foto, CV): volume Docker `portfolio_media`. Ikutkan dalam backup server, misalnya:
  `docker run --rm -v portfolio_media:/m -v "$PWD/backups":/b alpine tar czf /b/media-$(date +%F).tgz -C /m .`

## Deploy ke VPS tersendiri

```bash
cp .env.example .env   # isi semua nilai, termasuk DOMAIN
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Arahkan DNS domain ke IP server sebelum menjalankan perintah di atas; Caddy akan mengurus sertifikat HTTPS. Backup database tersimpan harian di `./backups` (default disimpan 7 hari). File upload ada di volume Docker `media`; ikutkan volume ini dalam backup server.

## Test

```bash
cd api && mvn verify          # unit test + integration test (Testcontainers, butuh Docker)
cd web && npm run lint && npm run typecheck && npm run build
```

CI di GitHub Actions menjalankan semuanya pada setiap push ke `master` dan setiap pull request.

## Struktur API

| Endpoint | Akses | Fungsi |
|---|---|---|
| `GET /api/public/site` | publik | Semua konten yang dipublikasikan, untuk beranda |
| `GET /api/public/case-studies/{slug}` | publik | Satu case study lengkap dengan isi Markdown |
| `GET /api/media/{id}` | publik | Foto dan CV |
| `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | — | Sesi admin |
| `GET/PUT /api/admin/profile` | admin | Profil dan pengaturan situs |
| `/api/admin/{experiences,projects,case-studies,skill-groups,education,certifications}` | admin | CRUD + `PUT /reorder` |
| `POST /api/admin/media` | admin | Upload gambar/PDF |
| `GET /api/admin/audit-logs` | admin | Riwayat perubahan |
| `POST /api/admin/publish` | admin | Paksa perbarui cache website |

## Catatan

- Setelah `npm install` pertama, commit `web/package-lock.json` agar build selalu memakai versi dependency yang sama.
- Bahasa default pengunjung ditentukan dari header `Accept-Language` browser (`en*` → English, selain itu Bahasa Indonesia).
