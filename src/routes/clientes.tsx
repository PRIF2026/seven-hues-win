import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, ProgressoPontos, SectionCard, Selo, StatusPill } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, SORTEIOS, VENDAS, pontosDaVenda } from "@/lib/cgs-data";

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

function Clientes() {
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState(CLIENTES[0]!.id);

  const lista = useMemo(
    () =>
      CLIENTES.filter((c) =>
        [c.nome, c.cpf, c.carteira].join(" ").toLowerCase().includes(busca.toLowerCase()),
      ),
    [busca],
  );
  const cliente = CLIENTES.find((c) => c.id === sel)!;
  const compras = VENDAS.filter((v) => v.cliente === cliente.nome);
  const sorteios = SORTEIOS.filter((s) => s.carteira === cliente.carteira);

  return (
    <>
      <PageHeader titulo="Controle de clientes" descricao="Pesquise por nome, CPF ou número da carteira e acompanhe a carteira programada." />

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <SectionCard titulo={`Clientes (${lista.length})`}>
          <input
            placeholder="Nome, CPF ou carteira"
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
                  <span className="block truncate text-xs text-muted-foreground">{c.carteira} · {c.cpf}</span>
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
                ["CPF", cliente.cpf],
                ["Telefone", cliente.telefone],
                ["E-mail", cliente.email],
                ["Nascimento", cliente.nascimento],
                ["Endereço", cliente.endereco],
                ["Número da carteira", cliente.carteira],
                ["Data de cadastro", cliente.cadastro],
                ["Data programada", cliente.dataSorteada ?? "Não sorteada"],
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
                {cliente.selos.map((s, i) => <Selo key={i} n={s} size="sm" />)}
              </div>
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
                        <td className="py-2.5 pr-3">{v.data}</td>
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
                        Sorteio {s.dataSorteio} · {s.ganhadores} ganhador(es) · previsão {s.previsaoPagamento}
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
