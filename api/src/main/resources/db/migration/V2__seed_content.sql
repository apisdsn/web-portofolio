-- Initial content. Everything here can be edited later from the admin dashboard.

CREATE FUNCTION pg_temp.l(id_text TEXT, en_text TEXT) RETURNS JSONB
    LANGUAGE sql IMMUTABLE AS $fn$ SELECT jsonb_build_object('id', id_text, 'en', en_text) $fn$;

INSERT INTO profile (id, full_name, headline, sub_headline, status_text, location, email,
                     linkedin_url, github_url, contact_text, accent_color, default_lang,
                     seo_title, seo_description)
VALUES (1,
        'Hafiz Adha Febrian',
        pg_temp.l('Backend developer yang membangun API dan microservices yang aman — dari enkripsi kolom database sampai SSO.',
                  'Backend developer building secure APIs and microservices — from column-level database encryption to SSO.'),
        pg_temp.l('Java & Spring Boot, TypeScript & LoopBack 4, dan PostgreSQL. Saat ini Full Stack Programmer di PT Techno International Mandira, mengembangkan aplikasi SIMPeL4 untuk Ombudsman Republik Indonesia.',
                  'Java & Spring Boot, TypeScript & LoopBack 4, and PostgreSQL. Currently a Full Stack Programmer at PT Techno International Mandira, building SIMPeL4 for the Ombudsman of the Republic of Indonesia.'),
        pg_temp.l('Sibuk ngoding', 'Open To Work'),
        'Bekasi, Indonesia',
        'hafizadha166@gmail.com',
        'https://www.linkedin.com/in/apisdsn/',
        'https://github.com/apisdsn',
        pg_temp.l('Mau diskusi soal backend, kolaborasi, atau peluang ke depan? Cara tercepat menghubungi saya adalah lewat email atau LinkedIn.',
                  'Want to talk backend, collaboration, or future opportunities? The fastest way to reach me is by email or LinkedIn.'),
        '#1B6E47',
        'id',
        pg_temp.l('Hafiz Adha Febrian — Backend Developer', 'Hafiz Adha Febrian — Backend Developer'),
        pg_temp.l('Portofolio Hafiz Adha Febrian: backend developer Java/Spring Boot, TypeScript, dan PostgreSQL.',
                  'Portfolio of Hafiz Adha Febrian: backend developer working with Java/Spring Boot, TypeScript and PostgreSQL.'));

INSERT INTO experience (start_date, end_date, is_current, role, organization, description, stack, sort_order)
VALUES
    ('2026-07-01', NULL, TRUE,
     pg_temp.l('Full Stack Programmer', 'Full Stack Programmer'),
     'PT Techno International Mandira',
     pg_temp.l('Kembali ke PT Techno International Mandira dan ditempatkan di proyek pengembangan aplikasi SIMPeL4 Ombudsman Republik Indonesia.',
               'Rejoined PT Techno International Mandira, assigned to the SIMPeL4 application project for the Ombudsman of the Republic of Indonesia.'),
     '["Spring Boot", "LoopBack 4", "PostgreSQL"]', 0),
    ('2025-07-01', '2026-04-01', FALSE,
     pg_temp.l('Junior Back End Developer', 'Junior Back End Developer'),
     'PT Techno International Mandira',
     pg_temp.l('Mengembangkan dan memelihara 4 services backend SIMPeL4 Ombudsman RI, modul laporan JasperReports, serta dokumentasi REST API dengan Swagger. Ikut membangun PoC Business Intelligence ChatBot AI di AWS untuk BPJS Ketenagakerjaan.',
               'Built and maintained 4 backend services for SIMPeL4 (Ombudsman RI), JasperReports reporting modules, and Swagger REST API documentation. Contributed to an AI Business Intelligence chatbot PoC on AWS for BPJS Ketenagakerjaan.'),
     '["LoopBack 4", "Spring Boot", "PostgreSQL", "MyBatis", "JasperReports", "Docker", "GitLab"]', 1),
    ('2025-05-01', '2025-05-01', FALSE,
     pg_temp.l('Peserta GenAI Hackathon 2025', 'GenAI Hackathon 2025 Participant'),
     'Alibaba Cloud Indonesia · GoTo · Komdigi',
     pg_temp.l('Membangun backend prototipe ai-nutrition bersama tim 4 orang dalam 48 jam.',
               'Built the backend of the ai-nutrition prototype with a team of 4 in 48 hours.'),
     '["Alibaba Cloud", "Qwen LLM", "SahabatAI LLM", "PAI", "RDS", "ECS"]', 2),
    ('2024-07-01', '2025-02-01', FALSE,
     pg_temp.l('Back End Developer Intern', 'Back End Developer Intern'),
     'PT Indonesia Indicator',
     pg_temp.l('Membangun REST API Spring Boot untuk sistem kepegawaian dengan enkripsi kolom PostgreSQL (pgcrypto, AES-256, Blowfish, RSA), serta engine web scraping Scrapy yang terintegrasi Apache Kafka.',
               'Built Spring Boot REST APIs for an HR system with PostgreSQL column-level encryption (pgcrypto, AES-256, Blowfish, RSA), plus a Scrapy web scraping engine integrated with Apache Kafka.'),
     '["Java", "Spring Boot", "PostgreSQL", "Python", "Scrapy", "Kafka"]', 3),
    ('2023-08-01', '2024-02-01', FALSE,
     pg_temp.l('Back End Developer Intern', 'Back End Developer Intern'),
     'PT Indonesia Indicator',
     pg_temp.l('Membangun REST API Spring Boot dengan SSO OAuth 2.0/OpenID Connect dan IAM pihak ketiga, lengkap dengan logging, unit test, integration test, dan dokumentasi OpenAPI.',
               'Built Spring Boot REST APIs with OAuth 2.0/OpenID Connect SSO and third-party IAM, including logging, unit and integration tests, and OpenAPI documentation.'),
     '["Java", "Spring Boot", "OAuth 2.0", "OIDC", "JUnit5", "Mockito", "Swagger"]', 4);

INSERT INTO project (slug, name, tag, description, repo_url, demo_url, sort_order)
VALUES
    ('hris-encryption', 'hris-encryption',
     pg_temp.l('GitHub · Jupyter Notebook · 2024', 'GitHub · Jupyter Notebook · 2024'),
     pg_temp.l('REST API Spring Boot untuk sistem HR dengan enkripsi tingkat kolom PostgreSQL (pgcrypto, AES-256, Blowfish, RSA), ditambah engine web scraping Scrapy yang terintegrasi dengan Apache Kafka.',
               'Built Spring Boot REST APIs for an HR system with PostgreSQL column-level encryption (pgcrypto, AES-256, Blowfish, RSA), plus a Scrapy web scraping engine integrated with Apache Kafka.'),
     'https://github.com/apisdsn/hris-encryption', NULL, 0),
    ('sso-zitadel', 'sso-zitadel',
     pg_temp.l('GitHub · Java · 2024', 'GitHub · Java · 2024'),
     pg_temp.l('REST API Spring Boot dengan SSO OAuth 2.0/OpenID Connect dan IAM pihak ketiga, lengkap dengan logging, unit test, integration test, dan dokumentasi OpenAPI.',
               'Built Spring Boot REST APIs with OAuth 2.0/OpenID Connect SSO and third-party IAM, including logging, unit and integration tests, and OpenAPI documentation.'),
     'https://github.com/apisdsn/sso-zitadel', NULL, 1),
    ('ai-nutrition', 'ai-nutrition',
     pg_temp.l('GenAI Hackathon 2025 · Alibaba Cloud', 'GenAI Hackathon 2025 · Alibaba Cloud'),
     pg_temp.l('Prototipe solusi AI di bidang makanan untuk ekosistem GoTo. Saya memegang backend dan integrasi Qwen LLM, SahabatAI LLM, PAI, Model Studio, RDS, dan ECS.',
               'An AI prototype in the food space for the GoTo ecosystem. I owned the backend and the integration of Qwen LLM, SahabatAI LLM, PAI, Model Studio, RDS and ECS.'),
     NULL, NULL, 2),
    ('scraping-engine', 'scraping-engine',
     pg_temp.l('PT Indonesia Indicator', 'PT Indonesia Indicator'),
     pg_temp.l('Engine web scraping dengan Scrapy (Python) yang mengalirkan hasilnya lewat Apache Kafka.',
               'A web scraping engine built with Scrapy (Python) that streams its results through Apache Kafka.'),
     NULL, NULL, 3),
    ('bi-chatbot-poc', 'bi-chatbot-poc',
     pg_temp.l('BPJS Ketenagakerjaan · AWS', 'BPJS Ketenagakerjaan · AWS'),
     pg_temp.l('Proof of concept chatbot Business Intelligence berbasis AI yang dibangun secara kolaboratif di ekosistem AWS.',
               'A collaborative proof of concept for an AI-powered Business Intelligence chatbot on AWS.'),
     NULL, NULL, 4);

INSERT INTO case_study (slug, title, summary, tags, role, period, organization, stack,
                        problem, approach, result, metrics, body, featured, sort_order)
VALUES
    ('column-level-encryption',
     pg_temp.l('Enkripsi tingkat kolom database pada microservice data kepegawaian',
               'Column-level database encryption for an employee data microservice'),
     pg_temp.l('Proyek magang di PT Indonesia Indicator yang menjadi skripsi saya: melindungi data pegawai yang sensitif di PostgreSQL dengan pgcrypto, serta menerapkan AES-256, Blowfish, dan RSA di arsitektur microservices.',
               'An internship project at PT Indonesia Indicator that became my undergraduate thesis: protecting sensitive employee data in PostgreSQL with pgcrypto, and applying AES-256, Blowfish and RSA across a microservices architecture.'),
     '["PostgreSQL", "pgcrypto", "Microservices"]',
     pg_temp.l('Back End Developer Intern', 'Back End Developer Intern'),
     pg_temp.l('Jul 2024 – Feb 2025 · proyek skripsi', 'Jul 2024 – Feb 2025 · thesis project'),
     'PT Indonesia Indicator',
     'Spring Boot · PostgreSQL · pgcrypto',
     pg_temp.l('Data kepegawaian berisi informasi sensitif yang harus tetap terlindungi, bahkan jika database atau backup-nya jatuh ke tangan yang salah.',
               'Employee records hold sensitive information that must stay protected, even if the database or its backups end up in the wrong hands.'),
     pg_temp.l('Enkripsi tingkat kolom di PostgreSQL dengan pgcrypto, plus enkripsi dan dekripsi di layer service Spring Boot memakai AES-256, Blowfish, dan RSA.',
               'Column-level encryption in PostgreSQL with pgcrypto, plus encryption and decryption in the Spring Boot service layer using AES-256, Blowfish and RSA.'),
     pg_temp.l('[Kolom apa saja yang terlindungi, overhead performanya, dan hasil pengujian dari skripsi.]',
               '[Which columns are protected, the performance overhead, and the test results from the thesis.]'),
     '[{"value": "3", "label": {"id": "Algoritma diterapkan: AES-256, Blowfish, RSA", "en": "Algorithms applied: AES-256, Blowfish, RSA"}},
       {"value": "[n]", "label": {"id": "Jumlah kolom sensitif yang dienkripsi", "en": "Sensitive columns encrypted"}},
       {"value": "[n] ms", "label": {"id": "Overhead rata-rata per query", "en": "Average overhead per query"}}]',
     pg_temp.l($md$## Konteks

Sistem kepegawaian di PT Indonesia Indicator dibangun dengan arsitektur microservices berbasis Java Spring Boot dan PostgreSQL. [Tambahkan: data apa yang dilindungi, dan siapa saja yang boleh mengaksesnya.]

## Arsitektur

`Client` → `Microservice kepegawaian (Spring Boot)` → `PostgreSQL + pgcrypto (kolom terenkripsi)`

[Ganti dengan diagram arsitektur aslinya.]

## Implementasi

[Jelaskan alurnya: kapan data dienkripsi di service, kapan memakai fungsi pgcrypto di database, dan bagaimana REST API mengembalikan data yang sudah didekripsi.]

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO employee (name, nik_enc)
VALUES ($1, pgp_sym_encrypt($2, $3, 'cipher-algo=aes256'));

SELECT name, pgp_sym_decrypt(nik_enc, $3) AS nik
FROM employee WHERE id = $4;
```

_Contoh ilustrasi pemakaian pgcrypto. Ganti dengan potongan kode asli dari proyek._

## Perbandingan algoritma

| Algoritma | Jenis | Karakteristik | Dipakai untuk |
|---|---|---|---|
| AES-256 | Simetris, blok 128-bit | Standar modern, cepat, dan umumnya didukung akselerasi hardware. | [isi] |
| Blowfish | Simetris, blok 64-bit | Algoritma lama; ukuran blok kecil kurang ideal untuk data bervolume besar. | [isi] |
| RSA | Asimetris (public/private key) | Lambat untuk data besar; cocok untuk mengamankan kunci atau data berukuran kecil. | [isi] |

## Manajemen kunci

[Di mana kunci disimpan, bagaimana rotasinya, dan service mana yang boleh mendekripsi.]

## Hasil & pelajaran

[Temuan utama dari pengujian di skripsi, dan satu hal yang akan dilakukan berbeda jika mengulang.]
$md$,
               $md$## Context

The HR system at PT Indonesia Indicator runs on a microservices architecture built with Java Spring Boot and PostgreSQL. [Add: what data is protected, and who is allowed to access it.]

## Architecture

`Client` → `Employee microservice (Spring Boot)` → `PostgreSQL + pgcrypto (encrypted columns)`

[Replace with the real architecture diagram.]

## Implementation

[Explain the flow: when data is encrypted in the service, when pgcrypto functions run in the database, and how the REST API returns decrypted data.]

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO employee (name, nik_enc)
VALUES ($1, pgp_sym_encrypt($2, $3, 'cipher-algo=aes256'));

SELECT name, pgp_sym_decrypt(nik_enc, $3) AS nik
FROM employee WHERE id = $4;
```

_Illustrative pgcrypto example. Replace it with a real snippet from the project._

## Algorithm comparison

| Algorithm | Type | Characteristics | Used for |
|---|---|---|---|
| AES-256 | Symmetric, 128-bit block | Modern standard, fast, and commonly hardware-accelerated. | [fill in] |
| Blowfish | Symmetric, 64-bit block | Older algorithm; its small block size is less suited to large data volumes. | [fill in] |
| RSA | Asymmetric (public/private key) | Slow for large data; well suited to protecting keys or small values. | [fill in] |

## Key management

[Where keys are stored, how they rotate, and which services may decrypt.]

## Results & lessons

[The main findings from the thesis testing, and one thing to do differently next time.]
$md$),
     TRUE, 0),
    ('simpel4-backend-services',
     pg_temp.l('SIMPeL4 Ombudsman RI: 4 services backend dalam satu sistem',
               'SIMPeL4, Ombudsman RI: 4 backend services in one system'),
     pg_temp.l('1 service LoopBack 4 (TypeScript) dan 3 service Spring Boot dengan MyBatis XML Mapper, plus modul laporan otomatis PDF/Excel berbasis JasperReports.',
               'One LoopBack 4 (TypeScript) service and three Spring Boot services using MyBatis XML Mappers, plus automated PDF/Excel reporting built on JasperReports.'),
     '["Spring Boot", "LoopBack 4", "JasperReports"]',
     pg_temp.l('Junior Back End Developer', 'Junior Back End Developer'),
     pg_temp.l('Jul 2025 – Apr 2026', 'Jul 2025 – Apr 2026'),
     'PT Techno International Mandira',
     'Spring Boot · LoopBack 4 · PostgreSQL · MyBatis · JasperReports',
     pg_temp.l('[Masalah utama yang diselesaikan di SIMPeL4.]', '[The main problem solved in SIMPeL4.]'),
     pg_temp.l('[Pendekatan teknis yang diambil.]', '[The technical approach taken.]'),
     pg_temp.l('[Hasil dan dampaknya.]', '[Results and impact.]'),
     '[]',
     pg_temp.l($md$## Konteks

[Tulis case study ini dari dashboard admin. Pastikan tidak membuka informasi yang bersifat rahasia.]
$md$,
               $md$## Context

[Write this case study from the admin dashboard. Make sure no confidential information is disclosed.]
$md$),
     FALSE, 1),
    ('sso-oauth2-oidc',
     pg_temp.l('Integrasi Single Sign-On dengan OAuth 2.0 & OpenID Connect',
               'Single Sign-On integration with OAuth 2.0 & OpenID Connect'),
     pg_temp.l('Konfigurasi server SSO dan Identity Access Management untuk REST API dengan pihak ketiga, diuji dengan JUnit5 dan Mockito.',
               'Configured the SSO server and Identity Access Management for REST APIs with a third party, tested with JUnit5 and Mockito.'),
     '["Spring Boot", "OAuth 2.0", "OIDC", "IAM"]',
     pg_temp.l('Back End Developer Intern', 'Back End Developer Intern'),
     pg_temp.l('Agu 2023 – Feb 2024', 'Aug 2023 – Feb 2024'),
     'PT Indonesia Indicator',
     'Spring Boot · OAuth 2.0 · OIDC · Zitadel',
     pg_temp.l('[Masalah yang diselesaikan dengan SSO.]', '[The problem SSO solved.]'),
     pg_temp.l('[Pendekatan integrasi OIDC.]', '[The OIDC integration approach.]'),
     pg_temp.l('[Hasil dan pelajaran.]', '[Results and lessons.]'),
     '[]',
     pg_temp.l($md$## Konteks

[Tulis case study ini dari dashboard admin.]
$md$,
               $md$## Context

[Write this case study from the admin dashboard.]
$md$),
     FALSE, 2);

INSERT INTO skill_group (label, items, sort_order)
VALUES
    (pg_temp.l('Bahasa pemrograman', 'Programming languages'),
     pg_temp.l('Java · TypeScript · JavaScript · Python (dasar)', 'Java · TypeScript · JavaScript · Python (basic)'), 0),
    (pg_temp.l('Framework & library', 'Frameworks & libraries'),
     pg_temp.l('Spring Boot · LoopBack 4 · Node.js · Express.js · Prisma · MyBatis · JasperReports · Scrapy',
               'Spring Boot · LoopBack 4 · Node.js · Express.js · Prisma · MyBatis · JasperReports · Scrapy'), 1),
    (pg_temp.l('Database', 'Databases'), pg_temp.l('PostgreSQL · MySQL', 'PostgreSQL · MySQL'), 2),
    (pg_temp.l('Tools', 'Tools'),
     pg_temp.l('Docker · Git · GitLab · Linux · Postman · Swagger/OpenAPI', 'Docker · Git · GitLab · Linux · Postman · Swagger/OpenAPI'), 3),
    (pg_temp.l('Cloud & AI', 'Cloud & AI'),
     pg_temp.l('Alibaba Cloud (ECS, PAI, OSS, RDS) · AWS (EC2, S3) · Qwen LLM · SahabatAI LLM',
               'Alibaba Cloud (ECS, PAI, OSS, RDS) · AWS (EC2, S3) · Qwen LLM · SahabatAI LLM'), 4),
    (pg_temp.l('Topik khusus', 'Focus areas'),
     pg_temp.l('RESTful API · Microservices · SSO (OAuth 2.0, OIDC) · Enkripsi database · Unit testing · Web scraping',
               'RESTful APIs · Microservices · SSO (OAuth 2.0, OIDC) · Database encryption · Unit testing · Web scraping'), 5);

INSERT INTO education (degree, institution, start_year, end_year, gpa, thesis, sort_order)
VALUES (pg_temp.l('S1 Informatika', 'Bachelor of Informatics'),
        'Universitas Teknologi Digital Indonesia, Yogyakarta',
        2021, 2025, '3.30/4.00',
        pg_temp.l('Skripsi: Implementasi Enkripsi Tingkat Kolom Database pada Microservice Data Kepegawaian (Studi Kasus: PT Indonesia Indicator).',
                  'Thesis: Implementing Column-Level Database Encryption in an Employee Data Microservice (Case Study: PT Indonesia Indicator).'),
        0);

INSERT INTO certification (name, issuer, year, sort_order)
VALUES
    (pg_temp.l('GenAI Hackathon 2025 — Sertifikat Partisipasi', 'GenAI Hackathon 2025 — Certificate of Participation'), 'Alibaba Cloud', 2025, 0),
    (pg_temp.l('Pelatihan Hackathon, Talent Scouting Academy', 'Hackathon Training, Talent Scouting Academy'), 'Komdigi', 2025, 1),
    (pg_temp.l('Junior Web Developer', 'Junior Web Developer'), 'BPPTIK Kominfo', 2021, 2),
    (pg_temp.l('Membuat Aplikasi Back-End untuk Pemula', 'Building Back-End Apps for Beginners'), 'Dicoding', 2023, 3),
    (pg_temp.l('Node.js Pemula Sampai Mahir', 'Node.js: Beginner to Advanced'), 'Udemy', 2023, 4);
