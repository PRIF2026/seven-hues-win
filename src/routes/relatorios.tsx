import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader, SectionCard, Selo } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, dataBr, LOJAS, PRODUTOS, SELOS, VENDAS, pontosDaVenda, seloPorPreco, type SeloNumber } from "@/lib/cgs-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Relatórios de vendas, clientes, produtos, pontos, cartelas, sorteios, premiações e receita com filtros e exportação." },
      { property: "og:title", content: "Relatórios · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Relatórios completos da promoção com filtros e exportação." },
    ],
  }),
  component: Relatorios,
});

const RELATORIOS = ["Vendas", "Clientes", "Produtos", "Pontos", "Cartelas", "Sorteios", "Premiações", "Pagamentos", "Receita", "Receita por filial", "Produtos por faixa", "Desempenho"];

function Relatorios() {
  const [tipo, setTipo] = useState("Vendas");

  const porSelo = SELOS.map((s) => ({
    selo: s.n as SeloNumber,
    produtos: PRODUTOS.filter((p) => seloPorPreco(p.preco) === s.n).length,
    pontos: VENDAS.filter((v) => v.selo === s.n).reduce((a, v) => a + pontosDaVenda(v), 0),
  }));

  return (
    <>
      <PageHeader
        titulo="Relatórios"
        descricao="Filtre por data, cliente, loja, produto, número do selo, situação e período."
        acoes={
          <>
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold">
              <FileText className="h-4 w-4" /> PDF
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
          </>
        }
      />

      <SectionCard titulo="Filtros">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs text-muted-foreground">Relatório
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              {RELATORIOS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">Período inicial
            <input type="date" defaultValue="2026-08-01" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
          </label>
          <label className="block text-xs text-muted-foreground">Período final
            <input type="date" defaultValue="2026-08-12" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
          </label>
          <label className="block text-xs text-muted-foreground">Loja
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option>Todas</option>{LOJAS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">Cliente
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option>Todos</option>{CLIENTES.map((c) => <option key={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">Número do selo
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option>Todos</option>{SELOS.map((s) => <option key={s.n}>{s.n}</option>)}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">Situação
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option>Todas</option><option>Em andamento</option><option>Premiada</option><option>Expirada</option>
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">Produto
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option>Todos</option>{PRODUTOS.map((p) => <option key={p.codigo}>{p.nome}</option>)}
            </select>
          </label>
        </div>
      </SectionCard>

      <SectionCard titulo={`Relatório de ${tipo.toLowerCase()}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Loja</th><th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Produto</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Selo</th><th className="py-2">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {VENDAS.map((v) => (
                <tr key={v.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3">{dataBr(v.data)}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{v.loja}</td>
                  <td className="py-2.5 pr-3">{v.cliente}</td>
                  <td className="py-2.5 pr-3">{v.produto}</td>
                  <td className="py-2.5 pr-3">{brl(v.unitario * v.qtd)}</td>
                  <td className="py-2.5 pr-3"><Selo n={v.selo} size="sm" /></td>
                  <td className="py-2.5 font-semibold">{pontosDaVenda(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard titulo="Produtos e pontos por faixa de preço (selos 1 a 7)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {porSelo.map((s) => (
            <div key={s.selo} className="rounded-lg border border-border p-3 text-center">
              <Selo n={s.selo} />
              <p className="mt-2 font-display text-lg font-bold text-foreground">{s.produtos}</p>
              <p className="text-[11px] text-muted-foreground">produtos</p>
              <p className="mt-1 text-xs font-semibold text-foreground">{s.pontos} pts</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
