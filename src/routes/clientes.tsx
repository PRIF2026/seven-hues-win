import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, ProgressoPontos, SectionCard, Selo, StatusPill } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, dataBr, SORTEIOS, VENDAS, pontosDaVenda, SELOS, type Cliente } from "@/lib/cgs-data";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Cadastro de clientes, carteira programada, pontos acumulados e histórico de compras e sorteios." },
      { property: "og:title", content: "Clientes · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Carteira programada, pontos e histórico de cada cliente." },
    ],
  }),
  component: Clientes,
});

const formVazio = {
  nome: "", associado: "", cpf: "", telefone: "", email: "",
  nascimento: "", endereco: "", carteira: "",
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES);
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState(CLIENTES[0]!.id);
  const [form, setForm] = useState({ ...formVazio });

  const lista = useMemo(
    () =>
      clientes.filter((c) =>
        [c.nome, c.cpf, c.carteira, c.associado].join(" ").toLowerCase().includes(busca.toLowerCase()),
      ),
    [clientes, busca],
  );
  const cliente = clientes.find((c) => c.id === sel) ?? clientes[0]!;
  const compras = VENDAS.filter((v) => v.cliente === cliente.nome);
  const sorteios = SORTEIOS.filter((s) => s.carteira === cliente.carteira);
  const selosOrdenados = [...cliente.selosDetalhe].sort((a, b) => a.data.localeCompare(b.data));

  const podeSalvar = form.nome.trim() !== "" && form.associado.trim() !== "";
  const cadastrar = () => {
    if (!podeSalvar) return;
    const id = `N${clientes.length + 1}`;
    const novo: Cliente = {
      id,
      nome: form.nome.trim(),
      associado: form.associado.trim(),
      cpf: form.cpf.trim() || "—",
      telefone: form.telefone.trim() || "—",
      email: form.email.trim() || "—",
      nascimento: form.nascimento || "",
      endereco: form.endereco.trim() || "—",
      carteira: form.carteira.trim() || `CGS-${String(133 + clientes.length).padStart(6, "0")}`,
      cadastro: new Date().toISOString().slice(0, 10),
      pontos: 0,
      selos: [],
      selosDetalhe: [],
      status: "Em andamento",
      dataSorteada: null,
      numeroSorteado: null,
      valorGasto: 0,
    };
    setClientes((prev) => [novo, ...prev]);
    setSel(id);
    setForm({ ...formVazio });
  };

  return (
    <>
      <PageHeader titulo="Controle de clientes" descricao="Cadastre e pesquise clientes por nome, CPF, número de associado ou carteira." />

      <SectionCard titulo="Cadastrar cliente">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["nome", "Nome completo", "text"],
            ["associado", "ASSOCIADO NÚMERO", "text"],
            ["cpf", "CPF", "text"],
            ["telefone", "Telefone", "tel"],
            ["email", "E-mail", "email"],
            ["nascimento", "Data de nascimento", "date"],
            ["endereco", "Endereço", "text"],
            ["carteira", "Número da carteira", "text"],
          ] as const).map(([k, label, tipo]) => (
            <label key={k} className="block text-xs text-muted-foreground">
              {label}
              <input
                type={tipo}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          ))}
        </div>
        <button onClick={cadastrar} disabled={!podeSalvar} className="mt-4 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          Cadastrar cliente
        </button>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <SectionCard titulo={`Clientes (${lista.length})`}>
          <input
            placeholder="Nome, CPF, associado ou carteira"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSel(c.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${c.id === sel ? "border-primary bg-accent" : "border-border hover:bg-accent/60"}`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{c.nome}</span>
                    <span className="shrink-0 font-display text-sm font-bold text-foreground">{c.pontos}</span>
                  </div>
                  <span className="block truncate text-xs text-muted-foreground">{c.associado} · {c.carteira} · {c.cpf}</span>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard titulo="Ficha do cliente" acao={<StatusPill status={cliente.status} />}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Nome", cliente.nome],
                ["Associado número", cliente.associado],
                ["CPF", cliente.cpf],
                ["Telefone", cliente.telefone],
                ["E-mail", cliente.email],
                ["Nascimento", dataBr(cliente.nascimento)],
                ["Endereço", cliente.endereco],
                ["Número da carteira", cliente.carteira],
                ["Data de cadastro", dataBr(cliente.cadastro)],
                ["Data programada", cliente.dataSorteada ? dataBr(cliente.dataSorteada) : "Não sorteada"],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="truncate text-sm font-medium text-foreground">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border p-3">
              <ProgressoPontos pontos={cliente.pontos} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selosOrdenados.map((s, i) => (
                  <Selo
                    key={i}
                    n={s.n}
                    size="sm"
                    titulo={`Selo ${s.n} (${SELOS[s.n - 1]?.nome}) · compra em ${dataBr(s.data)}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Selos em ordem cronológica — passe o mouse para ver a data da compra.
              </p>
            </div>
          </SectionCard>

          <SectionCard titulo="Histórico de compras">
            {compras.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma compra registrada no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Produto</th>
                      <th className="py-2 pr-3">Qtd</th><th className="py-2 pr-3">Valor</th>
                      <th className="py-2 pr-3">Selo</th><th className="py-2">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((v) => (
                      <tr key={v.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3">{dataBr(v.data)}</td>
                        <td className="py-2.5 pr-3">{v.produto}</td>
                        <td className="py-2.5 pr-3">{v.qtd}</td>
                        <td className="py-2.5 pr-3">{brl(v.unitario * v.qtd)}</td>
                        <td className="py-2.5 pr-3"><Selo n={v.selo} size="sm" /></td>
                        <td className="py-2.5 font-semibold">{pontosDaVenda(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard titulo="Histórico de sorteios e prêmios">
            {sorteios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cliente ainda não sorteou nenhuma data.</p>
            ) : (
              <ul className="space-y-2">
                {sorteios.map((s) => (
                  <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        Nº {s.numero} · dia {s.numero} de {s.mesReferencia} · {brl(s.valorOriginal / s.ganhadores)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sorteio {dataBr(s.dataSorteio)} · {s.ganhadores} ganhador(es) · previsão {dataBr(s.previsaoPagamento)}
                      </p>
                    </div>
                    <StatusPill status={s.statusPremio} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
