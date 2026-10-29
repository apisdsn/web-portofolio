-- 1. Adds the MoniShield case study (facts from the MoniShield repository: docs/01-prd.md, 04-plan.md
--    stage 40, 04a-measurements.md, 04c-crs-detection.md, 08-architecture.md, 09-status.md).
-- 2. Rewrites the three projects without a public link so the card says what was built and what my part was.
-- Every statement only fills content that still has its original text, so nothing edited in the admin is
-- overwritten, and the inserted case study is skipped if the slug already exists.

-- OR REPLACE: Flyway may run V2/V4 (which define the same helper) in the same session
CREATE OR REPLACE FUNCTION pg_temp.l(id_text TEXT, en_text TEXT) RETURNS JSONB
    LANGUAGE sql IMMUTABLE AS $fn$ SELECT jsonb_build_object('id', id_text, 'en', en_text) $fn$;

INSERT INTO case_study (slug, title, summary, tags, role, period, organization, stack,
                        problem, approach, result, metrics, body, featured, sort_order)
VALUES (
    'monishield',
    pg_temp.l('MoniShield: dari laporan log statis ke dashboard monitoring dan keamanan self-hosted',
              'MoniShield: from a static log report to a self-hosted monitoring and security dashboard'),
    pg_temp.l('Mengganti dashboard log berbentuk satu file HTML dengan aplikasi FastAPI + DuckDB + Svelte: log Kubernetes harian dibaca sekali, deteksi serangan memakai OWASP Core Rule Set, dan log dari Rancher masuk lewat Apache Kafka.',
              'Replacing a log dashboard that was a single HTML file with a FastAPI + DuckDB + Svelte application: daily Kubernetes logs are read once, attacks are detected with the OWASP Core Rule Set, and logs from Rancher arrive through Apache Kafka.'),
    '["DuckDB", "OWASP CRS", "Kafka"]',
    pg_temp.l('Pengembang utama: backend, frontend, dan deploy', 'Lead developer: backend, frontend and deploy'),
    pg_temp.l('Okt 2026 – sekarang', 'Oct 2026 – present'),
    'Ombudsman RI',
    'Python · FastAPI · DuckDB · PostgreSQL · Svelte 5 · Apache Kafka · Docker',
    pg_temp.l('Tim klien membaca log harian cluster lewat satu file dashboard.html. Setiap build mem-parsing ulang semua log (±40 menit untuk satu tahun data), semua hari dimuat sekaligus ke browser, dan daftar dipotong agar file tidak membengkak, sehingga sebagian angka KPI salah (misalnya error koneksi pod tertulis 200, padahal 1.200). File itu juga berisi email akun dan IP klien tanpa kontrol akses.',
              'The client team read the cluster''s daily logs through one dashboard.html file. Every build re-parsed all logs (about 40 minutes for a year of data), every day was loaded into the browser at once, and lists were cut short to keep the file small, so some KPIs were wrong (pod connection errors showed 200 instead of 1,200). The file also held account emails and client IPs with no access control.'),
    pg_temp.l('Aplikasi self-hosted yang membaca setiap folder log sekali ke DuckDB, lalu menyajikan laporan per halaman lewat FastAPI ke UI Svelte 5 dengan login dan peran. Aturan parsing lama dipertahankan dan dibuktikan setara lewat test. Deteksi serangan memakai 176 aturan OWASP CRS v4 dengan kategori CAPEC. Log bisa datang dari folder, S3, upload browser, atau Rancher lewat Kafka. Kode dipisah dengan clean architecture yang dijaga oleh test.',
              'A self-hosted application that reads each log folder once into DuckDB and serves per-page reports through FastAPI to a Svelte 5 UI with sign-in and roles. The old parsing rules were kept and proven equivalent by tests. Attack detection uses 176 OWASP CRS v4 rules with CAPEC categories. Logs can come from a folder, S3, a browser upload or Rancher through Kafka. The code follows a clean architecture that a test enforces.'),
    pg_temp.l('Dengan data simulasi satu tahun (365 folder, 48 juta request nginx), database hanya 4,75 GB dan ke-21 query satu halaman selesai dalam 20,5 ms. Setelah profiling, ingest menjadi 18× lebih cepat (folder 59 MB: 207 → 11,6 detik). CRS menangkap 24 probe file sensitif yang namanya di-encode dan lolos dari aturan lama, sambil menyaring tool scanner yang sebelumnya ikut dihitung sebagai serangan.',
              'On a simulated year of data (365 folders, 48 million nginx requests) the database is only 4.75 GB and all 21 queries of a page finish in 20.5 ms. After profiling, ingest became 18× faster (59 MB folder: 207 → 11.6 s). CRS caught 24 percent-encoded probes for sensitive files that slipped past the old rules, while filtering out scanner tools the old rules counted as attacks.'),
    jsonb_build_array(
        jsonb_build_object('value', '18×', 'label', pg_temp.l('Ingest lebih cepat setelah profiling (folder 59 MB: 207 → 11,6 detik)', 'Faster ingest after profiling (59 MB folder: 207 → 11.6 s)')),
        jsonb_build_object('value', '~20 ms', 'label', pg_temp.l('Semua 21 query satu halaman (20,5 ms), di atas data simulasi satu tahun', 'All 21 queries of a page (20.5 ms), on a simulated year of data')),
        jsonb_build_object('value', '176', 'label', pg_temp.l('Aturan OWASP CRS v4 yang dipakai untuk deteksi serangan', 'OWASP CRS v4 rules used for attack detection'))
    ),
    pg_temp.l($md$![MoniShield](https://monishield.apisdsn.com/og-id.png)

[Demo](https://monishield.apisdsn.com/) · [Kode sumber](https://github.com/apisdsn/MoniShield)

## Konteks

Aplikasi di cluster Kubernetes klien (ingress-nginx, CoreDNS, layanan Spring, dan frontend) mengekspor log setiap hari ke satu folder per tanggal. Tim membacanya lewat satu file `dashboard.html` hasil skrip Python. Isinya berguna: kesehatan layanan, indikasi serangan, aktivitas bisnis, dan asal pengguna. Cara pembuatannya yang tidak bisa bertahan:

| Masalah | Bukti di sistem lama |
|---|---|
| Semua log di-parse ulang setiap build | 11 folder = 14 detik; satu tahun ±131 juta baris ≈ 40 menit per build |
| Semua hari dimuat ke browser sekaligus | 2,3 MB untuk 11 folder, puluhan MB untuk satu tahun |
| Daftar dipotong, KPI dihitung dari daftar yang sudah terpotong | "Error koneksi pod" tertulis 200, padahal 1.200 |
| Tanpa kontrol akses | File berisi email akun dan IP klien, bisa disalin ke mana saja |

## Arsitektur

```text
Folder log  ─┐
S3 / R2     ─┤                     ┌─ DuckDB (log mentah + tabel agregat)
Upload      ─┼─► ingest + derive ──┤
Rancher ─► Kafka ─► inbox ─┘       └─ PostgreSQL (akun, sesi, audit)
                                          │
                       FastAPI (JWT, peran, Swagger) ─► Svelte 5 + MapLibre
                                          │
                        Telegram · Discord · email (alert & laporan harian)
```

Kode Python dibagi menjadi empat lapisan: **domain → application → infrastructure → interfaces**. Lapisan domain dan application tidak mengimpor paket pihak ketiga sama sekali (tanpa FastAPI, SQLAlchemy, DuckDB, boto3), dan aturan itu dijaga oleh `tests/test_architecture.py`, jadi import yang melanggar langsung menggagalkan CI.

## Keputusan teknis

- **DuckDB untuk analitik, PostgreSQL untuk akun.** Log bersifat tambah-saja dan dibaca dengan agregasi, cocok untuk database kolumnar yang tertanam di proses. Akun, sesi, dan audit log tetap di PostgreSQL lewat SQLAlchemy.
- **Ingest sekali, baca berkali-kali.** Folder baru atau file yang berubah saja yang dibaca; tanpa perubahan, ingest selesai dalam 0,4 detik. Halaman hanya membaca tabel agregat (CQRS ringan).
- **Setara dengan sistem lama.** Aturan parsing lama dipindahkan apa adanya, dan angka setiap folder dibandingkan dengan angka acuan sistem lama lewat test sebelum aturan baru diaktifkan.
- **OWASP CRS, bukan regex buatan sendiri.** 176 dari 203 aturan CRS v4.30.0 yang relevan diproses sekali menjadi JSON di repo (tidak ada unduhan saat runtime), dicocokkan seperti ModSecurity: transformasi `t:` berurutan, skor anomali, ambang 5, lalu dikelompokkan per kategori CAPEC.
- **Privasi IP.** Lokasi dan pemilik IP dicari secara offline dari database GeoLite2, DB-IP, dan iptoasn yang diunduh ke server, jadi IP pengguna tidak pernah dikirim ke layanan luar.
- **Kafka memakai format folder yang sama.** Consumer menulis pesan Kafka ke folder bergaya S3, sehingga pipeline ingest yang sama bisa dipakai, dan peta "LIVE" bisa menampilkan request yang sedang masuk.

## Performa

Diukur dengan menyalin folder terbesar (359 ribu baris log) ke 365 tanggal berurutan:

| Ukuran | Target | Hasil |
|---|--:|--:|
| Ukuran database 365 folder | ≤ 10 GB | **4,75 GB** |
| Semua query satu halaman | ≤ 200 ms | **20,5 ms** (21 query) |
| Tab Tren atas 365 folder | ≤ 500 ms | **5,4 ms** |
| Ingest tanpa perubahan | ≤ 5 detik | **0,4 detik** |

Saat ditanya apakah backend perlu ditulis ulang dengan Go, saya melakukan profiling dulu. Ternyata membaca dan mem-parsing log hanya memakan 1% waktu; 80% habis untuk memasukkan baris agregat satu per satu dengan `executemany`, dan 16% untuk analisis akun yang kompleksitasnya kuadratik. Perbaikannya: bulk insert lewat satu file JSON-lines yang dibaca DuckDB (±0,01 ms per baris) dan analisis akun berbasis bisection. Folder 59 MB turun dari 207 menjadi **11,6 detik**, folder 237 MB dari "tidak selesai dalam 29 menit" menjadi **27 detik**, dan hasilnya identik di ke-47 tabel.

## Deteksi serangan

Dibandingkan dengan aturan lama pada 5 folder yang punya log ingress-nginx:

| | Request ditandai |
|---|--:|
| Aturan lama | 315 |
| OWASP CRS | 110 |
| Ditandai keduanya | 86 |
| Hanya CRS | 24 |

Sebagian besar yang "hanya aturan lama" adalah User-Agent tool biasa (`Go-http-client`, `curl`) dan path CMS tanpa payload, yang menurut CRS bukan serangan. Sebaliknya, 24 request yang hanya ditangkap CRS adalah probe file sensitif yang namanya di-encode, misalnya `/%61%77%73-%63%6f%6e%66%69%67.%6a%73%6f%6e` (= `/aws-config.json`). CRS menjalankan `urlDecode` sebelum mencocokkan, sedangkan aturan lama tidak. Batasannya ditulis jelas di halaman Security: hanya bagian request yang tercatat di log yang diperiksa, jadi ini **bukan pengganti WAF**.

## Operasional

![Peta asal request di MoniShield (data contoh)](https://monishield.apisdsn.com/preview/map-light.jpg)

- **Keamanan:** sesi JWT, dua peran (admin dan user), reset password lewat email dengan kode, perubahan email diverifikasi lewat alamat lama dan baru, IP asli pengunjung di balik Cloudflare hanya dipercaya dari rentang IP Cloudflare.
- **Notifikasi:** Telegram, Discord, dan email untuk lonjakan error per layanan (dibandingkan rata-rata 7 hari) serta laporan harian.
- **Backup harian:** kedua database DuckDB dan tabel akun, dengan manifest SHA-256, disimpan 7 hari, dan bisa disalin ke object storage.
- **CI/CD:** GitHub Actions memeriksa pesan commit (Conventional Commits), menjalankan 338 test pytest, build web, dan smoke test browser di setiap halaman dalam dua bahasa. Merge ke branch `prd` men-deploy ke server secara otomatis.
- **Tanpa data klien di kode:** nama layanan, host, dan endpoint bisnis diambil dari `.env`. Test, contoh, dan dokumentasi memakai `example.com` dan IP sintetis, sehingga repo bisa dibuka untuk publik.

## Yang masih berjalan

Log ingress-nginx dari Rancher lewat Kafka masih menunggu izin `clusterloggings` di cluster. Log itulah yang dibutuhkan peta dan deteksi serangan untuk sumber Kafka. Langkah berikutnya adalah format log yang bisa dikonfigurasi, supaya MoniShield bisa membaca layanan selain yang sekarang.
$md$,
              $md$![MoniShield](https://monishield.apisdsn.com/og-en.png)

[Demo](https://monishield.apisdsn.com/) · [Source code](https://github.com/apisdsn/MoniShield)

## Context

The applications in the client's Kubernetes cluster (ingress-nginx, CoreDNS, Spring services and the frontend) export their logs every day into one folder per date. The team read them through a single `dashboard.html` file produced by a Python script. What it showed was useful: service health, attack indications, business activity and where users came from. The way it was built would not last:

| Problem | Evidence in the old system |
|---|---|
| Every build re-parsed every log | 11 folders = 14 s; a year of ~131 million lines ≈ 40 minutes per build |
| Every day loaded into the browser at once | 2.3 MB for 11 folders, tens of MB for a year |
| Lists cut short, KPIs computed from the cut lists | "Pod connection errors" showed 200 instead of 1,200 |
| No access control | The file held account emails and client IPs and could be copied anywhere |

## Architecture

```text
Log folder  ─┐
S3 / R2     ─┤                     ┌─ DuckDB (raw logs + aggregate tables)
Upload      ─┼─► ingest + derive ──┤
Rancher ─► Kafka ─► inbox ─┘       └─ PostgreSQL (accounts, sessions, audit)
                                          │
                       FastAPI (JWT, roles, Swagger) ─► Svelte 5 + MapLibre
                                          │
                        Telegram · Discord · email (alerts & daily report)
```

The Python code has four layers: **domain → application → infrastructure → interfaces**. The domain and application layers import no third-party package at all (no FastAPI, SQLAlchemy, DuckDB or boto3), and `tests/test_architecture.py` enforces it, so an import that breaks the rule fails CI.

## Technical decisions

- **DuckDB for analytics, PostgreSQL for accounts.** Logs are append-only and read through aggregations, a good fit for an embedded columnar database. Accounts, sessions and the audit log stay in PostgreSQL through SQLAlchemy.
- **Ingest once, read many times.** Only new folders or changed files are read; with nothing new, an ingest takes 0.4 s. Pages only read aggregate tables (light CQRS).
- **Equivalent to the old system.** The old parsing rules were moved over as they were, and each folder's numbers were checked against the old system's reference figures by tests before the new rules were switched on.
- **OWASP CRS instead of home-made regexes.** 176 of the 203 relevant CRS v4.30.0 rules are processed once into JSON in the repo (nothing is downloaded at runtime) and matched the way ModSecurity does: `t:` transformations in order, an anomaly score, a threshold of 5, then grouped by CAPEC category.
- **IP privacy.** IP locations and owners are looked up offline from GeoLite2, DB-IP and iptoasn databases downloaded to the server, so user IP addresses never leave it.
- **Kafka reuses the folder format.** The consumer writes Kafka messages into S3-style folders, so the same ingest pipeline applies, and a "LIVE" map can show requests as they arrive.

## Performance

Measured by copying the largest folder (359 thousand log lines) to 365 consecutive dates:

| Measure | Target | Result |
|---|--:|--:|
| Database size for 365 folders | ≤ 10 GB | **4.75 GB** |
| All queries of one page | ≤ 200 ms | **20.5 ms** (21 queries) |
| Trends tab over 365 folders | ≤ 500 ms | **5.4 ms** |
| Ingest with no changes | ≤ 5 s | **0.4 s** |

When asked whether the backend should be rewritten in Go, I profiled first. Reading and parsing the logs took only 1% of the time; 80% went into inserting aggregate rows one by one with `executemany`, and 16% into an account analysis with quadratic complexity. The fix: bulk inserts through one JSON-lines file read by DuckDB (~0.01 ms per row) and a bisection-based account analysis. A 59 MB folder went from 207 to **11.6 s**, a 237 MB folder from "not finished in 29 minutes" to **27 s**, with identical rows in all 47 tables.

## Attack detection

Compared with the old rules on the 5 folders that have ingress-nginx logs:

| | Requests flagged |
|---|--:|
| Old rules | 315 |
| OWASP CRS | 110 |
| Flagged by both | 86 |
| CRS only | 24 |

Most "old rules only" requests are common tool User-Agents (`Go-http-client`, `curl`) and CMS paths without a payload, which CRS does not treat as attacks. The 24 requests only CRS caught are probes for sensitive files with percent-encoded names, such as `/%61%77%73-%63%6f%6e%66%69%67.%6a%73%6f%6e` (= `/aws-config.json`). CRS applies `urlDecode` before matching; the old rules did not. The limit is stated on the Security page: only the parts of a request that the log records are inspected, so this is **not a WAF replacement**.

## Operations

![MoniShield request origin map (sample data)](https://monishield.apisdsn.com/preview/map-light.jpg)

- **Security:** JWT sessions, two roles (admin and user), password reset by email code, email changes verified through the old and the new address, and the visitor's real IP behind Cloudflare trusted only from Cloudflare's ranges.
- **Notifications:** Telegram, Discord and email for per-service error spikes (against the 7-day average) and a daily report.
- **Daily backup:** both DuckDB databases and the account tables, with a SHA-256 manifest, kept for 7 days, optionally copied to object storage.
- **CI/CD:** GitHub Actions checks commit messages (Conventional Commits), runs 338 pytest tests, builds the web UI and runs a browser smoke test on every page in both languages. A merge into the `prd` branch deploys to the server automatically.
- **No client data in the code:** service names, hosts and business endpoints come from `.env`. Tests, examples and docs use `example.com` and synthetic IPs, which made it possible to open the repository to the public.

## Still in progress

ingress-nginx logs from Rancher through Kafka are waiting for the `clusterloggings` permission on the cluster; those are the logs the map and attack detection need for the Kafka source. Next is configurable log formats, so MoniShield can read services beyond today's.
$md$),
    FALSE,
    1
)
ON CONFLICT (slug) DO NOTHING;

-- Project cards without a public link: say what was built and what my part was

UPDATE project
SET tag         = pg_temp.l('PT Indonesia Indicator · Python · Scrapy · 2024', 'PT Indonesia Indicator · Python · Scrapy · 2024'),
    description = pg_temp.l(
        'Satu spider Scrapy untuk situs apa pun: struktur halaman (daftar link, perulangan, paginasi, field wajib dan opsional) ditulis sebagai konfigurasi JSON berisi XPath di PostgreSQL, jadi situs baru cukup konfigurasi baru tanpa kode baru. Item hanya dikirim bila field wajibnya lengkap, hasilnya dialirkan ke Apache Kafka atau file JSON, request lewat proxy yang dirotasi, dan mode preview mengirim item pertama ke dashboard untuk mengecek konfigurasi.',
        'One Scrapy spider for any site: the page structure (link lists, loops, pagination, required and optional fields) is a JSON configuration of XPath expressions stored in PostgreSQL, so a new site needs a new configuration, not new code. Items are only emitted when their required fields are complete, results stream to Apache Kafka or a JSON file, requests go through rotating proxies, and a preview mode posts the first item to a dashboard to check a configuration.'),
    updated_at  = now()
WHERE slug = 'scraping-engine'
  AND description ->> 'en' = 'A web scraping engine built with Scrapy (Python) that streams its results through Apache Kafka.';

UPDATE project
SET tag         = pg_temp.l('GenAI Hackathon 2025 · Alibaba Cloud · FastAPI', 'GenAI Hackathon 2025 · Alibaba Cloud · FastAPI'),
    description = pg_temp.l(
        'Asisten gizi berbasis AI untuk ekosistem GoTo, dibuat tim 4 orang dalam 48 jam. Bagian saya backend: REST API FastAPI + SQLAlchemy di atas PostgreSQL (ApsaraDB RDS) untuk toko, menu, dan rating dari dataset GoFood, serta integrasi LLM Qwen dan SahabatAI (lewat Model Studio dan PAI) yang menjawab pertanyaan gizi berdasarkan data menu, berjalan di ECS.',
        'An AI nutrition assistant for the GoTo ecosystem, built by a team of 4 in 48 hours. My part was the backend: a FastAPI + SQLAlchemy REST API on PostgreSQL (ApsaraDB RDS) for shops, menus and ratings from a GoFood dataset, and the Qwen and SahabatAI LLM integration (through Model Studio and PAI) that answers nutrition questions from the menu data, running on ECS.'),
    updated_at  = now()
WHERE slug = 'ai-nutrition'
  AND description ->> 'en' = 'An AI prototype in the food space for the GoTo ecosystem. I owned the backend and the integration of Qwen LLM, SahabatAI LLM, PAI, Model Studio, RDS and ECS.';

UPDATE project
SET tag         = pg_temp.l('BPJS Ketenagakerjaan · AWS · FastAPI · 2025', 'BPJS Ketenagakerjaan · AWS · FastAPI · 2025'),
    description = pg_temp.l(
        'Proof of concept chatbot Business Intelligence berbasis AI di AWS, dikerjakan bersama tim. Bagian saya layanan autentikasi dan file: FastAPI dengan Amazon Cognito (daftar, verifikasi email, login, refresh token, lupa password, grup pengguna) dan Amazon S3 (bucket, folder, objek), plus pipeline GitLab CI yang menjalankan Ruff dan pytest, membangun image Docker multi-arsitektur, lalu deploy ke staging dan production.',
        'A collaborative proof of concept for an AI-powered Business Intelligence chatbot on AWS. My part was the authentication and file service: FastAPI with Amazon Cognito (sign-up, email verification, sign-in, refresh tokens, forgot password, user groups) and Amazon S3 (buckets, folders, objects), plus a GitLab CI pipeline that runs Ruff and pytest, builds multi-architecture Docker images and deploys to staging and production.'),
    updated_at  = now()
WHERE slug = 'bi-chatbot-poc'
  AND description ->> 'en' = 'A collaborative proof of concept for an AI-powered Business Intelligence chatbot on AWS.';

-- MoniShield was added in the admin; translate its tag only if it still has the text entered there
UPDATE project
SET tag        = pg_temp.l('Ombudsman RI · Python · Svelte · 2026', 'Ombudsman RI · Python · Svelte · 2026'),
    updated_at = now()
WHERE slug = 'monishield'
  AND tag ->> 'en' = 'Ombudsman Republik Indonesia · Python · Svelte · 2026';
