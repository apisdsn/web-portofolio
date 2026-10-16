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

## Deploy ke VPS

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
