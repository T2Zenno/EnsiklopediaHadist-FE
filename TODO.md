# Rencana Pengembangan Backend Laravel untuk Ensiklopedia Hadits AI

Dokumen ini merinci daftar tugas untuk membangun backend REST API menggunakan **Laravel**. Backend ini akan berfungsi sebagai otak dari aplikasi, menangani logika bisnis, autentikasi, data pengguna, dan interaksi dengan layanan eksternal. Frontend yang ada akan diubah untuk berkomunikasi dengan API ini, bukan lagi menggunakan `localStorage`.

**Arsitektur Umum:**
- **Backend:** Laravel (PHP)
- **Database:** MySQL / PostgreSQL
- **Autentikasi:** Laravel Sanctum (Token-based API, stateless)
- **Data Hadits:** Proxy ke API publik `https://api.hadith.gading.dev`
- **Layanan AI:** Dipanggil langsung dari sisi Frontend. Kunci API Google Gemini akan dikelola melalui variabel lingkungan di frontend.

---

## Fase 1: Penyiapan Proyek & Konfigurasi Dasar

Tujuan fase ini adalah menyiapkan fondasi proyek Laravel yang solid.

- [ ] **1. Inisialisasi Proyek Laravel**
    - [ ] Buat proyek Laravel baru: `composer create-project laravel/laravel ensiklopedia-hadits-api`
    - [ ] Konfigurasi file `.env`. Pastikan variabel berikut diatur dengan benar:
        - `APP_NAME="Ensiklopedia Hadits AI"`
        - `APP_URL=http://localhost:8000` (URL backend)
        - `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
        - `FRONTEND_URL=http://localhost:3000` (URL frontend untuk CORS)
        - `HADITH_API_BASE_URL=https://api.hadith.gading.dev` (Sumber data hadits)
        - **Catatan:** Panggilan ke Google Gemini API akan dilakukan langsung dari frontend. Oleh karena itu, `GEMINI_API_KEY` akan dikelola sebagai variabel lingkungan di sisi frontend, bukan di backend.

- [ ] **2. Instalasi & Konfigurasi Laravel Sanctum**
    - [ ] Install package: `composer require laravel/sanctum`
    - [ ] Publikasikan file konfigurasi dan migrasi: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
    - [ ] Jalankan migrasi: `php artisan migrate` (Ini akan membuat tabel `personal_access_tokens`).
    - [ ] Tambahkan trait `HasApiTokens` ke model `app/Models/User.php`.

- [ ] **3. Konfigurasi CORS (Cross-Origin Resource Sharing)**
    - [ ] Buka `config/cors.php`.
    - [ ] Atur `paths` menjadi `['api/*']`.
    - [ ] Atur `allowed_origins` agar merujuk ke `FRONTEND_URL` dari `.env`: `env('FRONTEND_URL', 'http://localhost:3000')`.

- [ ] **4. Instalasi Guzzle HTTP Client**
    - [ ] Guzzle akan digunakan untuk berkomunikasi dengan API Hadits.
    - [ ] Install: `composer require guzzlehttp/guzzle`.

---

## Fase 2: Desain Database & Model

Fase ini berfokus pada struktur data yang akan disimpan secara lokal.

- [ ] **1. Migrasi Tabel `users`**
    - [ ] Modifikasi file migrasi `..._create_users_table.php` yang sudah ada.
    - [ ] Tambahkan kolom `role` dengan `default('user')`: `$table->string('role')->default('user');`

- [ ] **2. Migrasi Tabel `favorites`**
    - [ ] Buat migrasi baru: `php artisan make:migration create_favorites_table`
    - [ ] Definisikan skema tabel:
        - `id` (primary key)
        - `user_id` (foreign key ke `users.id` dengan `onDelete('cascade')`)
        - `hadith_id` (string, e.g., 'bukhari-52', untuk identifikasi unik)
        - `book_id` (string, e.g., 'bukhari')
        - `hadith_number` (integer)
        - `timestamps`
    - [ ] Tambahkan *unique constraint* untuk `user_id` dan `hadith_id` untuk mencegah duplikasi favorit: `$table->unique(['user_id', 'hadith_id']);`

- [ ] **3. Model Eloquent**
    - [ ] Buat model `Favorite`: `php artisan make:model Favorite`
    - [ ] Definisikan relasi di `app/Models/User.php`:
        ```php
        public function favorites() {
            return $this->hasMany(Favorite::class);
        }
        ```
    - [ ] Definisikan relasi di `app/Models/Favorite.php`:
        ```php
        public function user() {
            return $this->belongsTo(User::class);
        }
        ```

- [ ] **4. Seeder Database (Opsional, sangat direkomendasikan)**
    - [ ] Buat seeder: `php artisan make:seeder UserSeeder`
    - [ ] Dalam seeder, buat akun admin (`'role' => 'admin'`) dan beberapa pengguna demo.

---

## Fase 3: Autentikasi & Rute Pengguna

Fase ini mengimplementasikan sistem login, registrasi, dan otorisasi.

- [ ] **1. Buat `AuthController`**
    - [ ] Buat controller: `php artisan make:controller Api/AuthController`
    - [ ] **Metode `register()`**:
        - Validasi input (nama, email, password).
        - Buat user baru.
        - Buat token: `$token = $user->createToken('auth_token')->plainTextToken;`
        - Kembalikan response JSON: `{ "user": { ... }, "token": "..." }`.
    - [ ] **Metode `login()`**:
        - Validasi kredensial.
        - Jika berhasil, buat token baru.
        - Kembalikan response JSON yang sama seperti register.
        - Jika gagal, kembalikan error 401 Unauthorized.
    - [ ] **Metode `logout()`**:
        - Hapus token saat ini: `auth()->user()->currentAccessToken()->delete();`
        - Kembalikan response sukses 200.
    - [ ] **Metode `user()`**:
        - Kembalikan data user yang terautentikasi: `return response()->json(auth()->user());`.

- [ ] **2. Definisikan Rute API (`routes/api.php`)**
    - [ ] Rute publik (tanpa middleware): `/register` dan `/login`.
    - [ ] Grup rute yang dilindungi `auth:sanctum`:
        ```php
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
            // Rute-rute lain yang butuh autentikasi akan ditambahkan di sini
        });
        ```
    - **Konteks Alur Kerja Token:** Frontend akan menyimpan token yang diterima saat login/register (misal, di localStorage) dan menyertakannya di setiap *header* permintaan ke rute yang dilindungi: `Authorization: Bearer <token>`.

---

## Fase 4: Fitur Inti Aplikasi

Implementasi fitur utama: menampilkan hadits dan manajemen favorit.

- [ ] **1. Proxy API Hadits (`HadithController`)**
    - [ ] Buat controller: `php artisan make:controller Api/HadithController`
    - [ ] **Konteks:** Backend akan bertindak sebagai *proxy* ke `HADITH_API_BASE_URL` yang ada di `.env`. Ini menyembunyikan kompleksitas dari frontend dan memungkinkan kita menambahkan *caching* di sisi server untuk performa dan efisiensi.
    - [ ] `GET /books`: Ambil daftar kitab dari API eksternal.
    - [ ] `GET /books/{bookId}`: Ambil daftar hadits dari satu kitab (dengan paginasi).
    - [ ] `GET /books/{bookId}/{hadithNumber}`: Ambil detail satu hadits.
    - [ ] `GET /search`: Teruskan query pencarian ke API eksternal.

- [ ] **2. Manajemen Favorit (`FavoriteController`) - Data Terisolasi**
    - [ ] Buat controller: `php artisan make:controller Api/FavoriteController`
    - [ ] **Konteks Isolasi Data:** Setiap query harus memastikan data yang diakses hanya milik pengguna yang sedang login. Ini adalah aspek keamanan paling krusial.
    - [ ] `GET /favorites` (dilindungi):
        - Ambil semua ID favorit dari database: `$favorites = auth()->user()->favorites;`
        - Lakukan panggilan ke API hadits eksternal untuk mendapatkan detail setiap hadits favorit.
    - [ ] `POST /favorites` (dilindungi):
        - Validasi input (`hadith_id`, `book_id`, `hadith_number`).
        - Simpan favorit baru: `auth()->user()->favorites()->create($validatedData);`
    - [ ] `DELETE /favorites/{hadith_id}` (dilindungi):
        - Cari favorit: `$favorite = auth()->user()->favorites()->where('hadith_id', $hadith_id)->firstOrFail();`
        - Hapus record: `$favorite->delete();`

---

## Fase 5: Fungsionalitas Admin

Membangun area terproteksi untuk manajemen pengguna.

- [ ] **1. Buat Middleware untuk Admin**
    - [ ] Buat middleware: `php artisan make:middleware IsAdmin`
    - [ ] Logika di middleware: `if (auth()->check() && auth()->user()->role === 'admin') { return $next($request); } return response()->json(['message' => 'Unauthorized'], 403);`
    - [ ] Daftarkan middleware di `app/Http/Kernel.php` (misal, dengan alias `'is_admin'`).

- [ ] **2. Buat `Admin/UserController`**
    - [ ] Buat controller di dalam namespace Admin: `php artisan make:controller Api/Admin/UserController`
    - [ ] Buat grup rute di `routes/api.php`:
        ```php
        Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
            Route::apiResource('users', AdminUserController::class);
            Route::get('users/export', [AdminUserController::class, 'exportCsv']);
        });
        ```
    - [ ] Implementasikan metode CRUD untuk pengguna (index, store, show, update, destroy).
    - [ ] Implementasikan metode `exportCsv` untuk mengunduh data pengguna.

---

## Fase 6: Finalisasi & Best Practices

Menyempurnakan API agar lebih robust dan mudah dikelola.

- [ ] **1. Validasi Request**
    - [ ] Gunakan Form Request class (`php artisan make:request StoreUserRequest`) untuk validasi yang kompleks agar controller tetap bersih.

- [ ] **2. Penanganan Error & API Resources**
    - [ ] Kustomisasi `app/Exceptions/Handler.php` untuk mengembalikan response JSON yang konsisten pada semua jenis error.
    - [ ] Gunakan [API Resources](https://laravel.com/docs/eloquent-resources) untuk mentransformasi model Eloquent (seperti `User`) menjadi response JSON yang terstruktur.

- [ ] **3. Dokumentasi API**
    - [ ] Buat Postman Collection atau gunakan tools seperti Scribe (`composer require --dev knuckleswtf/scribe`) untuk menghasilkan dokumentasi API secara otomatis.

- [ ] **4. Testing**
    - [ ] Tulis *feature tests* (`php artisan make:test AuthTest`) untuk setiap endpoint API untuk memastikan fungsionalitas dan keamanan.