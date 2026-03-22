"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  FileText,
  Image,
  Loader2,
  Check,
  AlertCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

interface Anexo {
  id: string;
  nomeOriginal: string;
  url: string;
  tipo: string;
  tamanho: number;
}

interface FormData {
  titulo: string;
  observacao: string;
  data: string;
  valor: string;
  tipo: "ENTRADA" | "SAIDA";
  categoriaId: string;
}

interface TransacaoFormProps {
  transacaoId?: string;
  dadosIniciais?: Partial<FormData> & { anexos?: Anexo[] };
  modo: "criar" | "editar";
}

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

function formatarBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function TransacaoForm({ transacaoId, dadosIniciais, modo }: TransacaoFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    titulo: dadosIniciais?.titulo ?? "",
    observacao: dadosIniciais?.observacao ?? "",
    data: dadosIniciais?.data ?? format(new Date(), "yyyy-MM-dd"),
    valor: dadosIniciais?.valor ?? "",
    tipo: dadosIniciais?.tipo ?? "ENTRADA",
    categoriaId: dadosIniciais?.categoriaId ?? "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategorias(data); })
      .catch(() => {});
  }, []);

  const [valorMascarado, setValorMascarado] = useState<string>(() => {
    const v = dadosIniciais?.valor;
    if (!v || isNaN(parseFloat(v))) return "";
    return parseFloat(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  const [anexos, setAnexos] = useState<Anexo[]>(dadosIniciais?.anexos ?? []);
  const [arquivosUpload, setArquivosUpload] = useState<File[]>([]);
  const [erros, setErros] = useState<Partial<FormData>>({});
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [arrastando, setArrastando] = useState(false);

  const [modalCat, setModalCat] = useState(false);
  const [nomeCat, setNomeCat] = useState("");
  const [corCat, setCorCat] = useState("#6366f1");
  const [salvandoCat, setSalvandoCat] = useState(false);
  const [erroCat, setErroCat] = useState<string | null>(null);

  const CORES_PRESET = [
    "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899",
    "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  ];

  const criarCategoria = async () => {
    if (!nomeCat.trim()) return;
    setSalvandoCat(true);
    setErroCat(null);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCat.trim(), cor: corCat }),
      });
      const data = await res.json();
      if (!res.ok) { setErroCat(data.error ?? "Erro ao criar"); return; }
      setCategorias((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setForm((prev) => ({ ...prev, categoriaId: data.id }));
      setModalCat(false);
      setNomeCat("");
      setCorCat("#6366f1");
    } catch {
      setErroCat("Erro ao criar categoria");
    } finally {
      setSalvandoCat(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErros((prev) => ({ ...prev, [name]: "" }));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeros = e.target.value.replace(/\D/g, "");
    if (!numeros) {
      setValorMascarado("");
      setForm((prev) => ({ ...prev, valor: "" }));
      setErros((prev) => ({ ...prev, valor: "" }));
      return;
    }
    const numero = parseInt(numeros, 10) / 100;
    const formatado = numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setValorMascarado(formatado);
    setForm((prev) => ({ ...prev, valor: String(numero) }));
    setErros((prev) => ({ ...prev, valor: "" }));
  };

  const validar = () => {
    const novosErros: Partial<FormData> = {};
    if (!form.titulo.trim()) novosErros.titulo = "Título é obrigatório";
    if (!form.data) novosErros.data = "Data é obrigatória";
    if (!form.valor || parseFloat(form.valor) <= 0)
      novosErros.valor = "Valor deve ser maior que zero";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const adicionarArquivos = useCallback((files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files).filter((f) => {
      const tiposOk = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
      return tiposOk.includes(f.type) && f.size <= 10 * 1024 * 1024;
    });
    setArquivosUpload((prev) => [...prev, ...novos]);
  }, []);

  const removerArquivo = (idx: number) => {
    setArquivosUpload((prev) => prev.filter((_, i) => i !== idx));
  };

  const removerAnexoExistente = async (id: string) => {
    try {
      await fetch(`/api/anexos/${id}`, { method: "DELETE" });
      setAnexos((prev) => prev.filter((a) => a.id !== id));
    } catch {
      console.error("Erro ao remover anexo");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    adicionarArquivos(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    setMensagem(null);

    try {
      let id = transacaoId;

      if (modo === "criar") {
        const res = await fetch("/api/transacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Erro ao criar transação");
        const data = await res.json();
        id = data.id;
      } else {
        const res = await fetch(`/api/transacoes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Erro ao atualizar transação");
      }

      // Upload de arquivos
      for (const arquivo of arquivosUpload) {
        const fd = new FormData();
        fd.append("transacaoId", id!);
        fd.append("arquivo", arquivo);
        await fetch("/api/upload", { method: "POST", body: fd });
      }

      setMensagem({ tipo: "sucesso", texto: modo === "criar" ? "Transação criada com sucesso!" : "Transação atualizada!" });
      setTimeout(() => router.push("/transacoes"), 1200);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: String(err) });
    } finally {
      setSalvando(false);
    }
  };

  const isTipoEntrada = form.tipo === "ENTRADA";

  const inputClass = (erro?: string) =>
    `w-full px-4 py-3 rounded-xl border text-base text-white placeholder:text-[#e5d3b9]/30 bg-[#065c62] outline-none transition focus:ring-2 focus:ring-offset-0 ${
      erro ? "border-red-500/50 focus:ring-red-500/30" : "border-[#e5d3b9]/15 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de transação */}
      <div className="flex rounded-xl overflow-hidden border border-[#e5d3b9]/15 bg-[#065c62]">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, tipo: "ENTRADA" }))}
          className={`flex-1 py-4 text-sm font-semibold transition-all ${
            isTipoEntrada
              ? "bg-emerald-500 text-white shadow-inner"
              : "text-[#e5d3b9]/60 hover:bg-[#054f54]"
          }`}
        >
          ↑ Entrada
        </button>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, tipo: "SAIDA" }))}
          className={`flex-1 py-4 text-sm font-semibold transition-all ${
            !isTipoEntrada
              ? "bg-red-500 text-white shadow-inner"
              : "text-[#e5d3b9]/60 hover:bg-[#054f54]"
          }`}
        >
          ↓ Saída
        </button>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Título */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#e5d3b9] mb-1">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Ex: Salário, Aluguel, Conta de luz..."
            className={inputClass(erros.titulo)}
          />
          {erros.titulo && <p className="text-red-400 text-xs mt-1">{erros.titulo}</p>}
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-[#e5d3b9] mb-1">
            Valor (R$) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e5d3b9]/50 text-sm font-medium">R$</span>
            <input
              type="text"
              name="valor"
              value={valorMascarado}
              onChange={handleValorChange}
              placeholder="0,00"
              inputMode="numeric"
              className={`${inputClass(erros.valor)} pl-10`}
            />
          </div>
          {erros.valor && <p className="text-red-400 text-xs mt-1">{erros.valor}</p>}
        </div>

        {/* Data */}
        <div className="min-w-0">
          <label className="block text-sm font-medium text-[#e5d3b9] mb-1">
            Data <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className={`${inputClass(erros.data)} [color-scheme:dark] max-w-full`}
          />
          {erros.data && <p className="text-red-400 text-xs mt-1">{erros.data}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-[#e5d3b9] mb-1">Categoria</label>
          <div className="flex gap-2">
            <select
              name="categoriaId"
              value={form.categoriaId}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white text-base outline-none transition focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { setModalCat(true); setNomeCat(""); setCorCat("#6366f1"); setErroCat(null); }}
              title="Nova categoria"
              className="w-12 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-[#e5d3b9]/60 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#054f54] transition flex items-center justify-center flex-shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Observação */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#e5d3b9] mb-1">Observação</label>
          <textarea
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            rows={3}
            placeholder="Adicione uma nota ou descrição..."
            className="w-full px-4 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none resize-none transition focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
          />
        </div>
      </div>

      {/* Área de upload */}
      <div>
        <label className="block text-sm font-medium text-[#e5d3b9] mb-2">
          Anexos (imagens ou PDF, máx. 10MB cada)
        </label>

        {/* Anexos existentes */}
        {anexos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {anexos.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 bg-[#065c62] rounded-xl px-3 py-2 text-sm border border-[#e5d3b9]/15"
              >
                {a.tipo === "image" ? (
                  <Image size={14} className="text-emerald-400" />
                ) : (
                  <FileText size={14} className="text-red-400" />
                )}
                <a href={a.url} target="_blank" rel="noreferrer" className="text-[#e5d3b9] hover:underline max-w-[150px] truncate">
                  {a.nomeOriginal}
                </a>
                <span className="text-[#e5d3b9]/40 text-xs">{formatarBytes(a.tamanho)}</span>
                <button
                  type="button"
                  onClick={() => removerAnexoExistente(a.id)}
                  className="text-[#e5d3b9]/40 hover:text-red-400 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
            ${arrastando ? "border-emerald-400 bg-emerald-500/10" : "border-[#e5d3b9]/20 hover:border-emerald-500/50 hover:bg-[#065c62]"}`}
        >
          <Upload size={24} className="mx-auto mb-2 text-[#e5d3b9]/40" />
          <p className="hidden sm:block text-sm text-[#e5d3b9]/60">
            Arraste arquivos ou <span className="text-emerald-400 font-medium">clique para selecionar</span>
          </p>
          <p className="sm:hidden text-sm font-semibold text-emerald-400">Toque para anexar arquivo</p>
          <p className="text-xs text-[#e5d3b9]/30 mt-1">JPG, PNG, GIF, WEBP, PDF</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => adicionarArquivos(e.target.files)}
          />
        </div>

        {/* Arquivos novos selecionados */}
        {arquivosUpload.length > 0 && (
          <div className="mt-3 space-y-2">
            {arquivosUpload.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20"
              >
                {f.type.startsWith("image/") ? (
                  <Image size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <FileText size={14} className="text-red-400 flex-shrink-0" />
                )}
                <span className="text-sm text-[#e5d3b9] truncate flex-1">{f.name}</span>
                <span className="text-xs text-[#e5d3b9]/40">{formatarBytes(f.size)}</span>
                <button type="button" onClick={() => removerArquivo(idx)} className="text-[#e5d3b9]/40 hover:text-red-400 transition">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
            ${mensagem.tipo === "sucesso" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-red-900/20 text-red-300 border border-red-500/30"}`}
        >
          {mensagem.tipo === "sucesso" ? <Check size={16} /> : <AlertCircle size={16} />}
          {mensagem.texto}
        </div>
      )}

      {/* Modal nova categoria */}
      {modalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setModalCat(false); }}>
          <div className="bg-[#054f54] border border-[#e5d3b9]/15 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Nova categoria</h3>
              <button type="button" onClick={() => setModalCat(false)} className="p-1.5 rounded-lg text-[#e5d3b9]/50 hover:bg-[#065c62] hover:text-white transition">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-xs text-[#e5d3b9]/70 mb-1 block">Nome</label>
              <input
                type="text"
                value={nomeCat}
                onChange={(e) => { setNomeCat(e.target.value); setErroCat(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); criarCategoria(); } }}
                placeholder="Ex: Alimentação, Transporte..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
              />
            </div>

            <div>
              <label className="text-xs text-[#e5d3b9]/70 mb-2 block">Cor</label>
              <div className="flex flex-wrap gap-2">
                {CORES_PRESET.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setCorCat(cor)}
                    className="w-8 h-8 rounded-lg border-2 transition flex items-center justify-center"
                    style={{ backgroundColor: cor, borderColor: corCat === cor ? "#e5d3b9" : "transparent" }}
                  >
                    {corCat === cor && <Check size={12} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {erroCat && <p className="text-red-400 text-xs">{erroCat}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalCat(false)}
                className="flex-1 py-3 rounded-xl border border-[#e5d3b9]/20 text-sm text-[#e5d3b9] hover:bg-[#065c62] transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={criarCategoria}
                disabled={salvandoCat || !nomeCat.trim()}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {salvandoCat ? "Salvando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 rounded-xl border border-[#e5d3b9]/20 text-base font-medium text-[#e5d3b9] hover:bg-[#065c62] transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className={`flex-1 py-4 rounded-xl text-base font-semibold text-white transition flex items-center justify-center gap-2
            ${isTipoEntrada ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}
            disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {salvando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            modo === "criar" ? "Salvar Transação" : "Atualizar"
          )}
        </button>
      </div>
    </form>
  );
}
