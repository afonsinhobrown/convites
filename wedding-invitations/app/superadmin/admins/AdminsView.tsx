"use client";

import { useState } from "react";
import { Users, UserPlus, KeyRound, Trash2, Shield, Loader2 } from "lucide-react";

interface AdminItem {
  id: string;
  name: string;
  email: string;
  isMaster: boolean;
  active: boolean;
  createdAt: string;
}

export function AdminsView({
  initialAdmins,
  currentAdmin,
}: {
  initialAdmins: AdminItem[];
  currentAdmin: { id: string; name: string; email: string; isMaster: boolean };
}) {
  const [admins, setAdmins] = useState<AdminItem[]>(initialAdmins);

  // Estados para Criar Novo Admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Estados para Alterar Própria Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newSelfPassword, setNewSelfPassword] = useState("");
  const [confirmSelfPassword, setConfirmSelfPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Criar Administrador
  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar administrador");
      }

      setAdmins((prev) => [data, ...prev]);
      setCreateSuccess(`Administrador "${newName}" criado com sucesso!`);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar administrador");
    } finally {
      setCreateLoading(false);
    }
  }

  // Remover Administrador
  async function handleDeleteAdmin(id: string, name: string) {
    if (!confirm(`Tem a certeza que deseja remover o administrador "${name}"?`)) return;

    try {
      const res = await fetch(`/api/superadmin/admins?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao remover administrador");
      }
    } catch {
      alert("Erro ao comunicar com o servidor");
    }
  }

  // Alterar Própria Senha
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassLoading(true);
    setPassError(null);
    setPassSuccess(null);

    if (newSelfPassword !== confirmSelfPassword) {
      setPassError("A confirmação da nova password não coincide.");
      setPassLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/superadmin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newSelfPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar password");
      }

      setPassSuccess("A sua password foi alterada com sucesso!");
      setCurrentPassword("");
      setNewSelfPassword("");
      setConfirmSelfPassword("");
    } catch (err) {
      setPassError(err instanceof Error ? err.message : "Erro ao alterar password");
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Topo com Título e Botão de Novo Administrador */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif-custom font-bold text-gray-900">
            Gestão de Administradores
          </h1>
          <p className="text-sm text-gray-500">
            Crie utilizadores com privilégio de SuperAdmin e faça a gestão de acessos e segurança
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          Novo Administrador
        </button>
      </div>

      {createSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          ✓ {createSuccess}
        </div>
      )}

      {/* Grid: Lista de Admins e Painel de Alteração de Senha */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Tabela de Administradores (2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              Utilizadores Administradores ({admins.length + 1})
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nome / Utilizador</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Privilégio</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {/* Linha do SuperAdmin Master */}
                <tr className="bg-amber-50/30">
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900 block">SuperAdmin Master</span>
                    <span className="text-[10px] text-amber-700">Conta Raiz / Principal</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">
                    master@doremi.local
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                      <Shield className="h-3 w-3" /> Master
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 italic text-[11px]">
                    Protegido
                  </td>
                </tr>

                {/* Linhas de Administradores Criados */}
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 block">{a.name}</span>
                      <span className="text-[10px] text-gray-400">
                        Criado em {new Date(a.createdAt).toLocaleDateString("pt-PT")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{a.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800">
                        SuperAdmin
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(a.id, a.name)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                        title="Remover este administrador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulário de Alteração da Própria Password */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-600" />
            Segurança da Minha Conta
          </h2>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <p className="text-xs text-gray-500">
              Sessão ativa como <strong>{currentAdmin.name}</strong> ({currentAdmin.email})
            </p>

            {currentAdmin.isMaster && currentAdmin.id === "master" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-700" />
                  Conta SuperAdmin Master
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  A password do utilizador Master é controlada diretamente através da variável de ambiente{" "}
                  <code className="bg-amber-100 px-1 rounded font-mono">SUPERADMIN_PASSWORD</code> na Vercel / ambiente de produção.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Password Atual
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Nova Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newSelfPassword}
                    onChange={(e) => setNewSelfPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Confirmar Nova Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmSelfPassword}
                    onChange={(e) => setConfirmSelfPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {passError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    {passError}
                  </div>
                )}

                {passSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-medium">
                    ✓ {passSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Nova Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Criar Novo Administrador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-600" />
                Criar Novo Administrador
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Email de Acesso
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@doremi.local"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Password Inicial (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Administrador"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
