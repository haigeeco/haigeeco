"use client";

import { useState } from "react";
import type { AppRole, Profile } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  roleLabel,
  useCreateUser,
  useCurrentProfile,
  useDeleteUser,
  useProfiles,
  useUpdateProfile,
} from "@/lib/db/users";
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select } from "@/components/ui";

const CREATE_ROLES: Array<{ value: AppRole; label: string }> = [
  { value: "staff_finance", label: "Staff Finance" },
  { value: "editor", label: "Editor" },
  { value: "superuser", label: "Superuser" },
];

const EDIT_ROLES: Array<{ value: string; label: string }> = [
  { value: "staff_finance", label: "Staff Finance" },
  { value: "editor", label: "Editor" },
  { value: "superuser", label: "Superuser" },
  { value: "", label: "Menunggu persetujuan" },
];

const ROLE_BADGE: Record<AppRole, string> = {
  superuser: "bg-indigo-50 text-indigo-700",
  editor: "bg-sky-50 text-sky-700",
  staff_finance: "bg-emerald-50 text-emerald-700",
};

function RoleBadge({ role }: { role: AppRole | null }) {
  if (!role) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        {roleLabel(role)}
      </span>
    );
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[role]}`}>
      {roleLabel(role)}
    </span>
  );
}

export default function AdminUsersPage() {
  const meQuery = useCurrentProfile();
  const profilesQuery = useProfiles();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();
  const deleteUser = useDeleteUser();

  const me = meQuery.data ?? null;

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff_finance" as AppRole,
  });
  const [createError, setCreateError] = useState("");

  const [editing, setEditing] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; role: string }>({
    full_name: "",
    role: "",
  });
  const [editError, setEditError] = useState("");

  function openCreate() {
    setCreateForm({ full_name: "", email: "", password: "", role: "staff_finance" });
    setCreateError("");
    setCreating(true);
  }

  function openEdit(profile: Profile) {
    setEditForm({ full_name: profile.full_name ?? "", role: profile.role ?? "" });
    setEditError("");
    setEditing(profile);
  }

  async function submitCreate() {
    setCreateError("");
    if (!createForm.email.trim()) {
      setCreateError("Email wajib diisi.");
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError("Kata sandi minimal 6 karakter.");
      return;
    }
    try {
      await createUser.mutateAsync({
        email: createForm.email.trim(),
        password: createForm.password,
        full_name: createForm.full_name.trim(),
        role: createForm.role,
      });
      setCreating(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Gagal membuat akun.");
    }
  }

  async function submitEdit() {
    if (!editing) return;
    setEditError("");
    try {
      await updateProfile.mutateAsync({
        id: editing.id,
        full_name: editForm.full_name.trim(),
        role: (editForm.role || null) as AppRole | null,
      });
      setEditing(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    }
  }

  async function remove(profile: Profile) {
    const label = profile.full_name || profile.email || "pengguna ini";
    if (!window.confirm(`Hapus akun "${label}"? Tindakan ini permanen.`)) return;
    try {
      await deleteUser.mutateAsync(profile.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus akun.");
    }
  }

  if (meQuery.isLoading) {
    return <Card className="p-6 text-sm text-slate-400">Memeriksa akses…</Card>;
  }

  if (me?.role !== "superuser") {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">
          Halaman ini hanya untuk <strong>superuser</strong>.
        </p>
      </Card>
    );
  }

  const profiles = profilesQuery.data ?? [];
  const pending = profiles.filter((profile) => !profile.role);

  return (
    <div>
      <PageHeader
        title="Pengguna"
        description="Tambah, ubah, dan hapus akun serta atur peran aksesnya."
        actions={<Button onClick={openCreate}>+ Tambah Pengguna</Button>}
      />

      {pending.length > 0 ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{pending.length}</strong> akun menunggu persetujuan. Ubah perannya lewat tombol
          Edit.
        </div>
      ) : null}

      {profilesQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat pengguna…</Card>
      ) : profilesQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat pengguna. Coba muat ulang.</Card>
      ) : profiles.length === 0 ? (
        <EmptyState
          title="Belum ada pengguna"
          description="Tambahkan akun pertama untuk tim Anda."
          action={<Button onClick={openCreate}>+ Tambah Pengguna</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Peran</th>
                  <th className="px-4 py-3 font-semibold">Bergabung</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const isSelf = profile.id === me?.id;
                  return (
                    <tr key={profile.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">
                          {profile.full_name || "(tanpa nama)"}
                        </span>
                        {isSelf ? (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            Anda
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{profile.email || "-"}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={profile.role} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(profile.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" onClick={() => openEdit(profile)}>
                              Edit
                            </Button>
                            <Button variant="ghost" onClick={() => remove(profile)}>
                              Hapus
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Peran menentukan menu yang tampil dan data yang boleh diakses (dibatasi Row Level Security).
        Pembuatan/penghapusan akun dilakukan lewat Edge Function <code>admin-users</code>.
      </p>

      <Modal
        open={creating}
        title="Tambah Pengguna"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Batal
            </Button>
            <Button onClick={submitCreate} disabled={createUser.isPending}>
              {createUser.isPending ? "Menyimpan…" : "Buat Akun"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Nama Lengkap">
            <Input
              value={createForm.full_name}
              onChange={(event) => setCreateForm({ ...createForm, full_name: event.target.value })}
              placeholder="Contoh: Rina Kartika"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
              placeholder="nama@geeco.id"
            />
          </Field>
          <Field label="Kata Sandi" hint="Minimal 6 karakter — sampaikan ke pengguna untuk masuk.">
            <Input
              type="text"
              value={createForm.password}
              onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
              placeholder="kata-sandi-awal"
            />
          </Field>
          <Field label="Peran">
            <Select
              value={createForm.role}
              onChange={(event) =>
                setCreateForm({ ...createForm, role: event.target.value as AppRole })
              }
            >
              {CREATE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </Field>
          {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}
        </div>
      </Modal>

      <Modal
        open={editing !== null}
        title="Edit Pengguna"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={submitEdit} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Nama Lengkap">
            <Input
              value={editForm.full_name}
              onChange={(event) => setEditForm({ ...editForm, full_name: event.target.value })}
            />
          </Field>
          <Field label="Email" hint="Email tidak dapat diubah.">
            <Input value={editing?.email ?? ""} disabled />
          </Field>
          <Field label="Peran">
            <Select
              value={editForm.role}
              onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}
            >
              {EDIT_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </Field>
          {editError ? <p className="text-sm text-rose-600">{editError}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
