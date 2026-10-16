-- Fills the column-level encryption case study with the results of the thesis
-- "Implementasi Enkripsi Tingkat Kolom Database pada Microservice Data Kepegawaian" (UTDI, 2025).
-- Response times are read from the thesis charts (Gambar 4.6 and 4.7) and rounded.

-- OR REPLACE: Flyway may run V2 (which defines the same helper) in the same session
CREATE OR REPLACE FUNCTION pg_temp.l(id_text TEXT, en_text TEXT) RETURNS JSONB
    LANGUAGE sql IMMUTABLE AS $fn$ SELECT jsonb_build_object('id', id_text, 'en', en_text) $fn$;

UPDATE case_study
SET summary  = pg_temp.l(
        'Proyek magang di PT Indonesia Indicator yang menjadi skripsi saya: mengenkripsi NIK, NPWP, No. KK, dan alamat pegawai langsung di PostgreSQL dengan pgcrypto, lalu membandingkan Blowfish dan AES-256 dari sisi waktu respons.',
        'An internship project at PT Indonesia Indicator that became my undergraduate thesis: encrypting employee ID numbers, tax IDs, family card numbers and addresses inside PostgreSQL with pgcrypto, then comparing Blowfish and AES-256 on response time.'),
    tags     = '["PostgreSQL", "pgcrypto", "Microservices"]',
    stack    = 'Spring Boot · PostgreSQL · pgcrypto · GnuPG',
    problem  = pg_temp.l(
        'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi mewajibkan data seperti NIK, NPWP, No. KK, dan alamat pegawai dilindungi dari akses tidak sah. Di arsitektur microservices data itu dilayani banyak komponen, jadi butuh enkripsi yang kuat tapi tetap ringan.',
        'Indonesia''s Personal Data Protection Law (UU 27/2022) requires data such as employee ID numbers, tax IDs, family card numbers and addresses to be protected from unauthorised access. In a microservices architecture that data passes through many components, so the encryption had to be strong yet light.'),
    approach = pg_temp.l(
        'Enkripsi tingkat kolom di PostgreSQL: trigger PL/pgSQL mengenkripsi 4 kolom sensitif sebelum INSERT/UPDATE dengan pgcrypto dan kunci PGP dari GnuPG, lalu fungsi dekripsi dipanggil lewat LATERAL saat data dibaca. Blowfish dan AES-256 diuji dalam mode simetris dan asimetris untuk 0–500 data.',
        'Column-level encryption in PostgreSQL: a PL/pgSQL trigger encrypts 4 sensitive columns before INSERT/UPDATE using pgcrypto and PGP keys from GnuPG, and a decryption function is applied through LATERAL when data is read. Blowfish and AES-256 were tested in symmetric and asymmetric mode for 0–500 records.'),
    result   = pg_temp.l(
        'Pada mode simetris, Blowfish ±45% lebih cepat dari AES-256 untuk 500 data (INSERT ±3,0 vs ±5,4 detik; GET ±2,2 vs ±4,0 detik). Dekripsi asimetris jauh lebih lambat (±18 menit untuk 500 data). Rekomendasi: Blowfish bila prioritas kecepatan, AES-256 bila prioritas keamanan.',
        'In symmetric mode Blowfish was about 45% faster than AES-256 for 500 records (INSERT ~3.0 vs ~5.4 s; GET ~2.2 vs ~4.0 s). Asymmetric decryption was far slower (~18 minutes for 500 records). Recommendation: Blowfish when speed comes first, AES-256 when security does.'),
    metrics  = '[
        {"value": "4", "label": {"id": "Kolom sensitif terenkripsi: NIK, NPWP, No. KK, alamat", "en": "Sensitive columns encrypted: ID number, tax ID, family card number, address"}},
        {"value": "±45%", "label": {"id": "Blowfish lebih cepat dari AES-256 (simetris, 500 data)", "en": "Blowfish faster than AES-256 (symmetric, 500 records)"}},
        {"value": "±18 mnt", "label": {"id": "GET 500 data dengan dekripsi asimetris, vs ±4 detik simetris", "en": "GET of 500 records with asymmetric decryption, vs ~4 s symmetric"}}
    ]',
    body     = pg_temp.l($md$## Konteks

Sistem kepegawaian PT Indonesia Indicator berjalan di arsitektur microservices: permintaan dari client masuk lewat API Gateway lalu diteruskan ke layanan seperti ERM, HRIS, Attendance, dan Ticketing. Layanan HRIS memakai PostgreSQL sebagai basis data utama, dan menyimpan data pegawai yang termasuk data pribadi menurut UU No. 27 Tahun 2022: **NIK, NPWP, No. KK, dan alamat**.

Tujuannya: data sensitif tetap terlindungi meskipun database atau backup-nya bocor, tanpa membuat layanan menjadi lambat.

## Arsitektur

`Client` → `API Gateway` → `Service HRIS (Spring Boot)` → `PostgreSQL + pgcrypto`

Enkripsi dan dekripsi dilakukan di tingkat database, sehingga layanan lain tidak perlu menyimpan logika kriptografi sendiri.

## Implementasi

Trigger `BEFORE INSERT OR UPDATE` pada tabel `employee` memanggil fungsi yang mengenkripsi empat kolom sensitif dengan kunci publik:

```sql
CREATE OR REPLACE FUNCTION encrypt_data_table_employee()
RETURNS TRIGGER AS $$
DECLARE
  pub_key BYTEA := dearmor(pg_read_file('keys/pub.key'));
  options TEXT  := 'cipher-algo=bf, unicode-mode=1';
BEGIN
  NEW.nik    := pgp_pub_encrypt(NEW.nik::TEXT, pub_key, options);
  NEW.npwp   := pgp_pub_encrypt(NEW.npwp::TEXT, pub_key, options);
  NEW.alamat := pgp_pub_encrypt(NEW.alamat::TEXT, pub_key, options);
  NEW.no_kk  := pgp_pub_encrypt(NEW.no_kk::TEXT, pub_key, options);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Saat dibaca, fungsi `decrypt_employee_data` (memakai `pgp_pub_decrypt` dan kunci privat) dipanggil per baris lewat `LATERAL`, sehingga REST API langsung menerima data yang sudah didekripsi:

```sql
SELECT e.id, e.name, d.decrypted_nik, d.decrypted_npwp
FROM employee e,
     LATERAL decrypt_employee_data(e.nik, e.npwp, e.alamat, e.no_kk) AS d;
```

## Pengujian

Waktu respons diukur dari Spring Boot dengan MockMvc: `POST /api/employee` untuk menyimpan data (enkripsi) dan `GET /api/employees/all` untuk mengambil semuanya (dekripsi), dengan jumlah data 0 sampai 500, untuk mode simetris (`pgp_sym_*`) dan asimetris (`pgp_pub_*`).

| Mode | Operasi (500 data) | AES-256 | Blowfish |
|---|---|---|---|
| Simetris | INSERT | ±5,4 detik | ±3,0 detik |
| Simetris | GET | ±4,0 detik | ±2,2 detik |
| Asimetris | GET | ±18 menit | ±18 menit |

_Angka dibaca dari grafik hasil pengujian di skripsi dan dibulatkan._

Dekripsi dengan kunci publik/privat menjadi titik paling mahal: mengambil 500 data butuh belasan menit, sementara mode simetris hanya beberapa detik.

## Perbandingan algoritma

| Algoritma | Jenis | Karakteristik | Dipakai untuk |
|---|---|---|---|
| AES-256 | Simetris, blok 128-bit, 14 putaran | Ketahanan kriptografi lebih kuat, tetapi lebih lambat di pengujian ini. | Pilihan bila prioritas utama keamanan. |
| Blowfish | Simetris, blok 64-bit, kunci hingga 448-bit | Paling cepat di pengujian dan skalanya lebih baik saat data bertambah. | Pilihan bila prioritas utama kecepatan. |
| RSA | Asimetris (kunci publik/privat) | Memisahkan kunci untuk enkripsi dan dekripsi, tetapi dekripsinya sangat lambat. | Pasangan kunci PGP (GnuPG) untuk `pgp_pub_encrypt` / `pgp_pub_decrypt`. |

## Manajemen kunci

Pasangan kunci PGP dibuat dengan GnuPG. Kunci publik dipakai trigger enkripsi, sedangkan kunci privat beserta passphrase-nya hanya dipakai fungsi dekripsi. Kedua kunci dibaca dari direktori server database dengan `pg_read_file`, sehingga tidak pernah dikirim lewat API.

## Hasil & pelajaran

- Enkripsi tingkat kolom berhasil menjaga kerahasiaan data sensitif tanpa mengubah layanan lain di arsitektur microservices.
- Blowfish unggul dari sisi kecepatan; AES-256 tetap direkomendasikan bila prioritasnya ketahanan terhadap serangan kriptografi modern.
- Langkah berikutnya: pengujian dengan volume data yang jauh lebih besar, rotasi kunci berkala, dan pemantauan kinerja serta keamanan secara rutin.
$md$,
                         $md$## Context

PT Indonesia Indicator's HR system runs on a microservices architecture: client requests go through an API Gateway to services such as ERM, HRIS, Attendance and Ticketing. The HRIS service uses PostgreSQL as its main database and stores employee data that counts as personal data under Indonesia's Personal Data Protection Law (UU 27/2022): **ID number (NIK), tax ID (NPWP), family card number (No. KK) and address**.

The goal: keep that data protected even if the database or its backups leak, without slowing the services down.

## Architecture

`Client` → `API Gateway` → `HRIS service (Spring Boot)` → `PostgreSQL + pgcrypto`

Encryption and decryption happen at the database level, so the other services do not need their own cryptography code.

## Implementation

A `BEFORE INSERT OR UPDATE` trigger on the `employee` table calls a function that encrypts the four sensitive columns with the public key:

```sql
CREATE OR REPLACE FUNCTION encrypt_data_table_employee()
RETURNS TRIGGER AS $$
DECLARE
  pub_key BYTEA := dearmor(pg_read_file('keys/pub.key'));
  options TEXT  := 'cipher-algo=bf, unicode-mode=1';
BEGIN
  NEW.nik    := pgp_pub_encrypt(NEW.nik::TEXT, pub_key, options);
  NEW.npwp   := pgp_pub_encrypt(NEW.npwp::TEXT, pub_key, options);
  NEW.alamat := pgp_pub_encrypt(NEW.alamat::TEXT, pub_key, options);
  NEW.no_kk  := pgp_pub_encrypt(NEW.no_kk::TEXT, pub_key, options);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

On reads, the `decrypt_employee_data` function (using `pgp_pub_decrypt` and the private key) is applied to each row through `LATERAL`, so the REST API receives decrypted data directly:

```sql
SELECT e.id, e.name, d.decrypted_nik, d.decrypted_npwp
FROM employee e,
     LATERAL decrypt_employee_data(e.nik, e.npwp, e.alamat, e.no_kk) AS d;
```

## Testing

Response times were measured from Spring Boot with MockMvc: `POST /api/employee` to store records (encryption) and `GET /api/employees/all` to read them all back (decryption), for 0 to 500 records, in symmetric (`pgp_sym_*`) and asymmetric (`pgp_pub_*`) mode.

| Mode | Operation (500 records) | AES-256 | Blowfish |
|---|---|---|---|
| Symmetric | INSERT | ~5.4 s | ~3.0 s |
| Symmetric | GET | ~4.0 s | ~2.2 s |
| Asymmetric | GET | ~18 min | ~18 min |

_Values are read from the charts in the thesis and rounded._

Public/private-key decryption was by far the most expensive step: reading 500 records took well over ten minutes, while symmetric mode took a few seconds.

## Algorithm comparison

| Algorithm | Type | Characteristics | Used for |
|---|---|---|---|
| AES-256 | Symmetric, 128-bit block, 14 rounds | Stronger cryptographic resistance, but slower in these tests. | The choice when security is the top priority. |
| Blowfish | Symmetric, 64-bit block, keys up to 448-bit | Fastest in the tests and scaled better as data grew. | The choice when speed is the top priority. |
| RSA | Asymmetric (public/private key) | Separates the encryption and decryption keys, but decryption is very slow. | PGP key pair (GnuPG) for `pgp_pub_encrypt` / `pgp_pub_decrypt`. |

## Key management

The PGP key pair was generated with GnuPG. The public key is used by the encryption trigger; the private key and its passphrase are used only by the decryption function. Both keys are read from a directory on the database server with `pg_read_file`, so they never travel through the API.

## Results & lessons

- Column-level encryption kept sensitive data confidential without changing the other services in the microservices architecture.
- Blowfish wins on speed; AES-256 remains the recommendation when resistance to modern cryptographic attacks matters most.
- Next steps: testing at much larger data volumes, regular key rotation, and routine performance and security monitoring.
$md$)
WHERE slug = 'column-level-encryption';

DROP FUNCTION pg_temp.l(TEXT, TEXT);
