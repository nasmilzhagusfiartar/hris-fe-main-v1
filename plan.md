# Frontend Plan: Fitur Pengelolaan RBAC (Roles & Permissions)

Dokumen ini berfokus murni pada **fitur antarmuka pengelolaan (management UI)** Role dan Permission untuk user Manager, memanfaatkan API yang telah aktif di backend (termasuk pembuatan Role dan pembuatan Permission baru).

---

## 1. Lingkup Fitur Pengelolaan

Terdapat 5 alur kerja utama yang disediakan:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HALAMAN UTAMA MANAJEMEN RBAC                          │
│                                                                             │
│  [+ Tambah Role Baru]   [+ Tambah Permission Baru]    [🔍 Cari Role...]     │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │ 🛡️ Manager   [System]   │  │ 🛡️ HR        [System]   │                   │
│  │ 42 Permissions Terpasang│  │ 31 Permissions Terpasang│                   │
│  │ [Kelola Permission]     │  │ [Kelola Permission]     │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │ 🛡️ Supervisor [Custom]  │  │ ...                     │                   │
│  │ 5 Permissions Terpasang │  │                         │                   │
│  │ [Kelola Permission]     │  │                         │                   │
│  │ [Edit Nama] [Hapus]     │  │                         │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
└───────────────────────┬──────────────────────────┬──────────────────────────┘
                        │                          │
       Klik "Kelola Permission"         Klik "+ Tambah Permission Baru"
                        ▼                          ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│     MODAL PERMISSION MATRIX       │  │     MODAL TAMBAH PERMISSION       │
│                                   │  │                                   │
│ Role: Supervisor                  │  │ Modul / Grup:                     │
│ [✓] Pilih Semua  [ ] Kosongkan    │  │ [ audit-log             ▼ ]       │
│                                   │  │                                   │
│ ▼ Modul Employee                  │  │ Nama Aksi (Action):               │
│   [✓] employee-list               │  │ [ view                    ]       │
│   [✓] employee-create             │  │                                   │
│                                   │  │ Hasil Preview:                    │
│ ▼ Modul Team                      │  │ 🏷️ audit-log-view                 │
│   [✓] team-list                   │  │                                   │
│   [✓] team-view                   │  │ [ Batal ]            [ Simpan ]   │
│                                   │  └───────────────────────────────────┘
│ [ Batal ]    [ Simpan Perubahan ] │
└───────────────────────────────────┘
```

---

## 2. Rincian Fitur & Interaksi UI

### Fitur 1: Tambah Permission Baru (Create Permission)
* **Tujuan:** Memungkinkan Manager menambah permission kustom baru ke sistem (misal modul baru seperti `audit-log-view`, `report-export`, dll).
* **Komponen:** `CreatePermissionModal`
* **Pilihan Input UI (User Friendly):**
  * Opsi A (2 Field):
    * **Modul/Grup:** Dropdown modul yang sudah ada (`employee`, `team`, `payroll`, dll) atau ketik modul baru.
    * **Aksi:** Dropdown/text (`menu`, `list`, `view`, `create`, `edit`, `delete`, `export`, dll).
    * *Preview Otomatis:* Menampilkan gabungan nama: `<modul>-<aksi>` (contoh: `report-export`).
  * Opsi B (1 Field):
    * Input langsung nama permission lengkap: e.g. `audit-log-view`.
* **Submit:**
  * Endpoint: `POST /api/v1/permissions`
  * Body payload:
    ```json
    {
      "name": "report-export"
    }
    ```
  * Setelah berhasil, reload data matrix (`GET /api/v1/permissions/grouped`) agar permission baru langsung otomatis muncul di dalam grup modulnya pada modal checklist.

---

### Fitur 2: Tampilan Daftar Role (Role Cards / Table)
* **Data Source:** `GET /api/v1/roles`
* **Elemen UI:**
  * Menampilkan nama role.
  * Badge **`System`** jika `is_system_role === true` (Manager, HR, Finance, Employee).
  * Counter jumlah permission yang sedang aktif pada role tersebut (`permissions_count`).
  * Tombol aksi:
    * **`Kelola Permission`**: Membuka Matrix Modal.
    * **`Ubah Nama`**: Hanya muncul jika `is_system_role === false`.
    * **`Hapus`**: Hanya muncul jika `is_system_role === false`.

---

### Fitur 3: Matrix Checklist Permission (Fitur Inti)
* **Data Source:**
  * Struktur permission: `GET /api/v1/permissions/grouped`
  * Permission aktif role: diambil dari `role.permissions.map(p => p.name)`
* **Logika Interaksi:**
  1. **State Lokal:** Simpan permission yang dicentang dalam Set atau Array:
     ```typescript
     const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
     ```
  2. **Toggle Satuan:** Klik checkbox individual menambah/menghapus nama permission dari `selectedPermissions`.
  3. **Master Toggle per Modul:**
     * Tombol **"Pilih Semua"**: Mencentang seluruh permission dalam grup modul tersebut.
     * Tombol **"Kosongkan"**: Menghapus centang seluruh permission dalam grup modul tersebut.
  4. **Simpan (Submit):**
     * Kirim ke endpoint: `POST /api/v1/roles/{roleId}/assign-permissions`
     * Body payload:
       ```json
       {
         "permissions": ["team-list", "team-view", "employee-list", "report-export"]
       }
       ```
     * Berikan feedback toast/notifikasi sukses dan update state role di UI secara otomatis.

---

### Fitur 4: Tambah Role Baru
* **Form Sederhana:**
  * Input: `Nama Role` (contoh: "Team Leader", "Quality Assurance").
* **Submit:**
  * Endpoint: `POST /api/v1/roles`
  * Body payload:
    ```json
    { "name": "Team Leader" }
    ```
  * Setelah berhasil dibuat, tutup modal dan buka langsung modal **Permission Matrix** untuk role baru tersebut agar user bisa langsung memilih permission-nya.

---

### Fitur 5: Ubah Nama & Hapus Role
* **Ubah Nama:**
  * Endpoint: `PUT /api/v1/roles/{id}`
  * Body payload: `{ "name": "Team Lead Baru" }`
* **Hapus Role:**
  * Dialog konfirmasi: *"Apakah Anda yakin ingin menghapus role ini?"*
  * Endpoint: `DELETE /api/v1/roles/{id}`
  * *Catatan: Backend sudah otomatis menolak jika user mencoba menghapus role sistem.*

---

## 3. Integrasi Endpoint API Lengkap

Berikut fungsi pemanggilan API yang dibutuhkan untuk mengelola Role dan Permission:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const rbacApi = {
  // === ROLES ===
  // 1. Ambil daftar role
  getRoles: () => api.get('/roles').then(res => res.data.data),

  // 2. Tambah role baru
  createRole: (name: string) => api.post('/roles', { name }).then(res => res.data.data),

  // 3. Ubah nama role
  updateRole: (id: number, name: string) => api.put(`/roles/${id}`, { name }).then(res => res.data.data),

  // 4. Hapus role
  deleteRole: (id: number) => api.delete(`/roles/${id}`).then(res => res.data),

  // 5. Simpan / Sinkronisasi Permission ke Role
  assignPermissions: (roleId: number, permissions: string[]) =>
    api.post(`/roles/${roleId}/assign-permissions`, { permissions }).then(res => res.data.data),

  // === PERMISSIONS ===
  // 6. Ambil permission yang sudah dikelompokkan per modul (untuk checklist UI)
  getGroupedPermissions: () => api.get('/permissions/grouped').then(res => res.data.data),

  // 7. Tambah permission baru
  createPermission: (name: string) => api.post('/permissions', { name }).then(res => res.data.data),

  // 8. Hapus permission (opsional)
  deletePermission: (id: number) => api.delete(`/permissions/${id}`).then(res => res.data),
};
```

---

## 4. Contoh Logika Checklist Matrix (React / Vue Pseudo-code)

```typescript
// Fungsi helper untuk toggle checkbox
const handleTogglePermission = (permissionName: string) => {
  setSelectedPermissions(prev =>
    prev.includes(permissionName)
      ? prev.filter(p => p !== permissionName)
      : [...prev, permissionName]
  );
};

// Fungsi helper "Pilih Semua" dalam satu grup modul
const handleSelectAllInGroup = (groupPermissions: { name: string }[]) => {
  const groupNames = groupPermissions.map(p => p.name);
  setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupNames])));
};

// Fungsi helper "Kosongkan" dalam satu grup modul
const handleDeselectAllInGroup = (groupPermissions: { name: string }[]) => {
  const groupNames = new Set(groupPermissions.map(p => p.name));
  setSelectedPermissions(prev => prev.filter(name => !groupNames.has(name)));
};
```

---

## 5. Checklist Pengerjaan Frontend

- [ ] **Modal Tambah Permission Baru**:
  - [ ] Input nama permission (e.g. `modul-aksi`).
  - [ ] Submit ke `POST /api/v1/permissions`.
  - [ ] Refresh data matrix grouped permission.
- [ ] **Komponen Role List**: Card/tabel menampilkan daftar role, badge system, dan jumlah permission.
- [ ] **Modal Tambah Role**: Input nama role dan tombol submit.
- [ ] **Modal Permission Matrix**:
  - [ ] Fetch data dari `/api/v1/permissions/grouped`.
  - [ ] Render section/accordion per modul (`attendance`, `employee`, `payroll`, `team`, dll).
  - [ ] Pasang tombol "Pilih Semua" & "Kosongkan" per modul.
  - [ ] Pasang tombol "Simpan" yang memanggil `/roles/{id}/assign-permissions`.
- [ ] **Aksi Hapus & Ubah Role**: Konfirmasi pop-up sebelum menghapus role kustom.
