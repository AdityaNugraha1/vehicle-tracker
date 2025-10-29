# Vehicle Tracker - Full Stack Application

Ini adalah aplikasi full-stack untuk manajemen dan pelacakan armada kendaraan. Aplikasi ini terdiri dari **Backend API** (Node.js, Express, Prisma) dan **Frontend SPA** (React, Vite, Zustand, React Query) yang terpisah. 

Aplikasi ini dapat diakses secara online menggunakan link 
```bash
vehicletracker.my.id
```
```bash
api.vehicletracker.my.id
```
dan untuk dokumentasi apinya ada di

```bash
api.vehicletracker.my.id/api-docs
```
##  Akun Demo

Untuk mencoba fitur berdasarkan peran pengguna, Anda dapat menggunakan akun demo berikut:

* **Admin:**
    * **Email:** `admin@vehicle.com`
    * **Password:** `admin123`
    * *(Memiliki akses penuh ke semua fitur, termasuk Manajemen Pengguna)*
* **Manager:**
    * **Email:** `manager@vehicle.com`
    * **Password:** `manager123`
    * *(Memiliki akses ke fitur manajemen kendaraan, perjalanan, dan perawatan, tetapi tidak bisa mengelola pengguna)*
* **User:**
    * **Email:** `user@vehicle.com`
    * **Password:** `user123`
    * *(Hanya memiliki akses lihat (read-only) ke sebagian besar fitur)*
---

## Fitur Utama

* **Autentikasi & Otorisasi:** Registrasi pengguna, login, dan refresh token menggunakan JWT.
* **Role-Based Access Control (RBAC):** Tiga level peran (ADMIN, MANAGER, USER) dengan *middleware* khusus di backend dan proteksi rute di frontend.
* **Manajemen Pengguna (Admin):** Admin dapat melakukan CRUD penuh pada pengguna, termasuk mengubah peran dan menghapus akun.
* **Manajemen Kendaraan (CRUD):** Fungsionalitas penuh untuk menambah, melihat, mengedit, dan menghapus kendaraan (dibatasi untuk Admin/Manager).
* **Manajemen Perjalanan (Trip):** Memulai dan mengakhiri perjalanan, yang secara otomatis mengubah status kendaraan (`AVAILABLE` $\leftrightarrow$ `ON_TRIP`).
* **Manajemen Perawatan:** Menjadwalkan, memulai, dan menyelesaikan catatan perawatan, yang juga dapat mengubah status kendaraan.
* **Pelacakan Peta Langsung:** Halaman peta (menggunakan Leaflet) yang menampilkan lokasi semua kendaraan secara *real-time*.
* **Pembuatan Laporan:** Backend dapat menghasilkan laporan (misalnya, penggunaan kendaraan) dalam format .xlsx.
* **Dokumentasi API:** Dokumentasi Swagger/OpenAPI yang dibuat secara otomatis.

---

## Tech Stack

### Backend (Monorepo: `backend/`)

* **Runtime:** Node.js
* **Framework:** Express.js
* **Bahasa:** TypeScript
* **ORM:** Prisma (dengan database SQL, misal: PostgreSQL)
* **Autentikasi:** JSON Web Tokens (JWT)
* **Validasi:** Zod
* **Testing:** Jest (Unit & Integration)
* **Dokumentasi:** Swagger (OpenAPI)

### Frontend (Monorepo: `frontend/`)

* **Library:** React 18
* **Build Tool:** Vite
* **Bahasa:** TypeScript (TSX)
* **Router:** React Router v6
* **State Management (Client):** Zustand
* **State Management (Server):** React Query (TanStack Query)
* **Styling:** TailwindCSS
* **Komponen UI:** shadcn/ui
* **Fetching Data:** Axios (dengan *interceptors* untuk *refresh token*)
* **Pemetaan:** React Leaflet

---

## 🏗️ Penjelasan Arsitektur

### Arsitektur Backend

Backend mengikuti pola **Controller-Service** yang ketat untuk pemisahan tanggung jawab:

1.  **Routes (`routes/*.routes.ts`):**
    * Mendefinisikan *endpoint* HTTP (misal, `POST /api/vehicles`).
    * Menerapkan *middleware* autentikasi (`authenticateToken`) dan otorisasi (`requireAdmin`).
    * Mengarahkan *request* ke *Controller* yang sesuai.

2.  **Controllers (`controllers/*.controller.ts`):**
    * Bertanggung jawab untuk menangani objek `Request` dan `Response` Express.
    * Memvalidasi data *input* (body/params) menggunakan skema Zod.
    * Memanggil *Service* yang relevan untuk menjalankan logika bisnis.
    * Mengirimkan respons HTTP (JSON atau status error).

3.  **Services (`services/*.service.ts`):**
    * Berisi **logika bisnis inti**.
    * Tidak mengetahui apa-apa tentang HTTP; hanya berinteraksi dengan data.
    * Berkomunikasi dengan database menggunakan **Prisma Client**.
    * Menangani logika kompleks, seperti mengubah status kendaraan saat perjalanan dimulai atau saat perawatan dijadwalkan.

[Image of Full-Stack React Express Prisma Architecture Diagram]

### Arsitektur Frontend

Frontend adalah **Single Page Application (SPA)** modern yang berfokus pada pemisahan *state*:

1.  **Server State (React Query):**
    * Digunakan untuk mengambil, menyimpan *cache*, dan memodifikasi data dari backend.
    * Hampir semua data (kendaraan, perjalanan, pengguna) dikelola oleh React Query (`useQuery`, `useMutation`).

2.  **Global Client State (Zustand):**
    * Digunakan khusus untuk *state* yang bersifat global di sisi klien, terutama **autentikasi**: menyimpan data pengguna yang login dan status `isAuthenticated`.

3.  **Services (`services/*.service.ts`):**
    * Berisi fungsi-fungsi untuk berinteraksi dengan Backend API menggunakan *instance* **Axios** terpusat.
    * *Instance* Axios ini memiliki *interceptor* yang secara otomatis menangani *refresh token* saat token kedaluwarsa.

4.  **Routing (React Router v6):**
    * `App.tsx` mendefinisikan semua rute halaman.
    * Menggunakan komponen `ProtectedRoute.tsx` untuk melindungi rute berdasarkan status autentikasi dan peran.

---

## Setup Lingkungan Pengembangan (Dev Env)

Proyek ini diasumsikan sebagai monorepo dengan folder `backend/` dan `frontend/`.

### 1. Backend Setup

1.  **Navigasi ke folder backend:**
    ```bash
    cd backend
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Buat file `.env`:**
    Buat file `.env` di dalam folder `backend/` dan isi variabel berikut:
    ```ini
    # URL koneksi database PostgreSQL Anda
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

    # Kunci rahasia untuk JWT
    JWT_SECRET="rahasia-anda-yang-sangat-kuat"
    JWT_REFRESH_SECRET="rahasia-refresh-token-yang-berbeda"

    # Port server (opsional)
    PORT=5000
    ```

4.  **Jalankan Migrasi Database:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Hasilkan Prisma Client:**
    ```bash
    npx prisma generate
    ```

6.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Server backend sekarang berjalan di `http://localhost:5000`.

### 2. Frontend Setup

1.  **Buka terminal baru dan navigasi ke folder frontend:**
    ```bash
    cd frontend
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Buat file `.env.local`:**
    Buat file `.env.local` di dalam folder `frontend/` dan tentukan URL backend API Anda:
    ```ini
    # Sesuaikan port jika backend Anda berjalan di port yang berbeda
    VITE_API_URL="http://localhost:5000/api"
    ```

4.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Aplikasi React sekarang berjalan di `http://localhost:5173`.

---

## Dokumentasi API

Backend ini menyajikan dokumentasi API menggunakan Swagger. Setelah server backend berjalan, Anda dapat mengaksesnya di:

**`http://localhost:5000/api-docs`** atau **`https://vehicletracker.my.id/api-docs`**

---

## Menjalankan Tes

Semua tes (unit dan integrasi) berada di backend.

1.  Pastikan Anda berada di folder `backend/`.
2.  Pastikan database tes Anda sudah terkonfigurasi di `.env`.
3.  Jalankan perintah tes:
    ```bash
    npm test
    ```

---

## Docker Setup

Proyek ini dilengkapi dengan konfigurasi Docker lengkap untuk pengembangan dan produksi, mengorkestrasi backend, frontend, dan database.

*Asumsi: File `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, dan `docker-compose.yml` ada di dalam repositori Anda.*

### 1. File Docker (Multi-stage)

* **`backend/Dockerfile`**: File multi-stage ini pertama-tama meng-install dependensi dan mem-build TypeScript ke JavaScript dalam *stage* `builder`. Kemudian, *stage* `production` menyalin artefak yang sudah di-build, `node_modules`, dan `prisma` untuk membuat *image* produksi yang ramping.
* **`frontend/Dockerfile`**: File ini juga multi-stage. *Stage* `builder` meng-install dependensi dan menjalankan `npm run build` untuk membuat file statis. *Stage* `production` menggunakan *image* `nginx:alpine` yang ringan dan menyalin file-file statis tersebut, serta konfigurasi Nginx kustom (`frontend/nginx.conf`) yang diperlukan untuk menangani *routing* React (SPA).

### 2. Docker Compose (Pengembangan)

File `docker-compose.yml` di *root* proyek dirancang untuk lingkungan pengembangan.

* Membangun dan menjalankan *container* `backend` dan `frontend`.
* Menjalankan *container* `db` (PostgreSQL) dan menyimpan datanya di *volume* Docker (`pgdata`).
* Menjalankan *container* `adminer` (opsional) di port `8080` untuk manajemen database.

#### Menjalankan di Lingkungan Pengembangan

1.  **Siapkan Environment Backend:**
    ```bash
    cp backend/.env.example backend/.env
    ```
    *(Pastikan `DATABASE_URL` di `backend/.env` sesuai dengan kredensial di `docker-compose.yml`)*

2.  **Siapkan Environment Frontend:**
    ```bash
    cp frontend/.env.local.example frontend/.env.local
    ```
    *(Pastikan `VITE_API_URL` diatur ke `http://localhost:5000/api`)*

3.  **Jalankan Compose:**
    ```bash
    docker-compose up -d --build
    ```

* Frontend akan dapat diakses di `http://localhost:5173`.
* Backend akan dapat diakses di `http://localhost:5000`.
* Adminer akan dapat diakses di `http://localhost:8080`.

---

## CI/CD Pipeline (GitHub Actions)

Proyek ini dikonfigurasi dengan tiga alur kerja GitHub Actions yang berada di `.github/workflows/`:

1.  **`main.yml` (Continuous Integration):**
    * **Trigger:** Otomatis berjalan pada setiap *push* atau *pull request* ke *branch* `main`.
    * **Tugas:**
        * `lint`: Menjalankan `npm run lint` untuk *code style*.
        * `test-backend`: Menjalankan `npm test` untuk backend (termasuk tes unit dan integrasi). Ini juga menyiapkan *service container* PostgreSQL untuk tes integrasi.
        * `build-frontend`: Menjalankan `npm run build` pada frontend untuk memastikan *build* berhasil.

2.  **`publish.yml` (Continuous Delivery - Build & Push):**
    * **Trigger:** Otomatis berjalan hanya pada *push* ke *branch* `main` (yaitu setelah PR di-*merge*).
    * **Tugas:**
        * Login ke Docker Hub (menggunakan *secrets*).
        * Membangun *image* Docker `backend` dan `frontend`.
        * Memberi *tag* `:latest` pada *image*.
        * Mendorong kedua *image* ke repositori Docker Hub Anda.

3.  **`deploy.yml` (Continuous Deployment - Deploy to VPS):**
    * **Trigger:** Berjalan secara manual (*workflow_dispatch*) atau otomatis setelah alur kerja `publish.yml` selesai.
    * **Tugas:**
        * Menggunakan SSH untuk terhubung ke Linux VPS Anda (menggunakan *secrets*).
        * Menjalankan *script* di VPS yang:
            1.  Pindah ke direktori aplikasi (misal, `/opt/vehicle-tracker`).
            2.  Menjalankan `docker-compose -f docker-compose.prod.yml pull` untuk mengambil *image* baru dari Docker Hub.
            3.  Menjalankan `systemctl restart vehicle-tracker` untuk me-restart layanan `systemd`, yang akan mematikan *container* lama dan menyalakan yang baru.

### Setup GitHub Secrets

Untuk mengaktifkan CI/CD, Anda harus mengatur *secrets* berikut di repositori GitHub Anda (Settings > Secrets and variables > Actions):

* `DOCKER_USERNAME`: Nama pengguna Docker Hub Anda.
* `DOCKER_PASSWORD`: *Access Token* Docker Hub Anda (bukan *password*).
* `SSH_HOST`: Alamat IP VPS Anda (misal, `123.45.67.89`).
* `SSH_USER`: Nama pengguna di VPS Anda (misal, `root` atau `ubuntu`).
* `SSH_KEY`: Kunci privat SSH Anda (isi dari file `.ssh/id_rsa`).

---

## Deployment (Linux VPS)

Berikut adalah panduan untuk mendeploy aplikasi ini di server Ubuntu menggunakan Nginx sebagai *reverse proxy* dan `systemd` untuk mengelola *container*.

### Prasyarat

* Server Ubuntu (misal, GCP Compute Engine).
* Domain yang sudah diarahkan (A Record `yourdomain.com` dan `api.yourdomain.com` menunjuk ke `123.45.67.89`).
* **Docker** dan **Docker Compose** ter-install di server.
* **Nginx** ter-install (`sudo apt install nginx`).
* **Certbot** ter-install (`sudo apt install certbot python3-certbot-nginx`).

### Langkah 1: Setup Nginx (Reverse Proxy)

1.  Buat file konfigurasi Nginx:
    ```bash
    sudo nano /etc/nginx/sites-available/vehicle-tracker
    ```

2.  Tempel konfigurasi Nginx berikut ke dalam file tersebut. **Ganti `yourdomain.com` dan `api.yourdomain.com` dengan domain Anda.**

    ```nginx
    # Server block untuk API Backend
    server {
        listen 80;
        server_name api.yourdomain.com; # Ganti ini

        location / {
            proxy_pass http://localhost:5000; # Mengarah ke container backend
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Server block untuk Frontend
    server {
        listen 80;
        server_name yourdomain.com; # Ganti ini

        location / {
            proxy_pass http://localhost:8080; # Mengarah ke container frontend Nginx
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  Aktifkan konfigurasi ini:
    ```bash
    sudo ln -s /etc/nginx/sites-available/vehicle-tracker /etc/nginx/sites-enabled/
    sudo nginx -t # Tes konfigurasi
    sudo systemctl restart nginx
    ```

### Langkah 2: Amankan dengan SSL (Let's Encrypt)

Jalankan Certbot untuk secara otomatis mendapatkan sertifikat SSL dan mengkonfigurasi Nginx:

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```
Certbot akan memodifikasi file konfigurasi Nginx Anda untuk menangani SSL (port 443) dan mengatur auto-renewal.

### Langkah 3: Siapkan File di Server

1.  Buat file konfigurasi Nginx:
    ```bash
    sudo mkdir -p /opt/vehicle-tracker
    cd /opt/vehicle-tracker
    ```
2.  Buat file docker-compose.prod.yml di /opt/vehicle-tracker. (Salin konten dari file docker-compose.prod.yml di     repositori Anda. Pastikan untuk mengganti yourdockerhub/... dengan nama image Anda yang sebenarnya).

3. Buat direktori untuk environment file:

    ```bash 
    sudo mkdir -p /etc/vehicle-tracker
    ```

4. Buat file environment produksi:

    ```bash 
    sudo nano /etc/vehicle-tracker/prod.env
    ``` 
    Isi file ini dengan kredensial produksi Anda (database, JWT secrets, dll.).
    ```bash 
    POSTGRES_USER=prod_user
    POSTGRES_PASSWORD=PasswordProduksiYangKuat
    POSTGRES_DB=vehicle_tracker_prod
    DATABASE_URL="postgresql://prod_user:PasswordProduksiYangKuat@db:5432/vehicle_tracker_prod?schema=public"
    JWT_SECRET="rahasia-produksi-anda-yang-sangat-kuat"
    JWT_REFRESH_SECRET="rahasia-refresh-token-produksi-yang-berbeda"
    NODE_ENV=production
    PORT=5000
    ``` 
### Langkah 4: Buat Layanan `systemd`

Buat file layanan `systemd` agar *container* Anda berjalan sebagai layanan:

```bash
sudo nano /etc/systemd/system/vehicle-tracker.service
``` 
Tempel konten berikut: (Pastikan path /usr/bin/docker-compose benar untuk server Anda)
```bash
[Unit]
Description=Vehicle Tracker Docker Compose Service
Requires=docker.service
After=docker.service
[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/vehicle-tracker
ExecStart=/usr/bin/docker-compose -f /opt/vehicle-tracker/docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f /opt/vehicle-tracker/docker-compose.prod.yml down
[Install]
WantedBy=multi-user.target
``` 
### Langkah 5: Deployment Pertama Kali

1.  Muat ulang daemon systemd untuk mengenali layanan baru:
    ```bash
    sudo systemctl daemon-reload
    cd /opt/vehicle-tracker
    ```
2.  Aktifkan layanan agar otomatis berjalan saat booting:
    ```bash
    sudo systemctl enable vehicle-tracker.service
    ```
3.  Tarik image yang sudah Anda push ke Docker Hub secara manual (hanya untuk pertama kali):
    ```bash 
    sudo docker pull yourdockerhub/vehicle-tracker-backend:latest
    sudo docker pull yourdockerhub/vehicle-tracker-frontend:latest  
    ```
4.  Mulai layanan:
    ```bash 
    sudo systemctl start vehicle-tracker.service
    ``` 
Aplikasi Anda sekarang seharusnya sudah berjalan dan dapat diakses melalui https://yourdomain.com dan https://api.yourdomain.com.

### Langkah 6: Deployment Otomatis (via CI/CD)
Setelah setup awal selesai, setiap kali Anda me-merge ke branch main, alur kerja deploy.yml akan mengambil alih, menghubungkan ke server Anda, menarik image baru, dan me-restart layanan systemd secara otomatis.