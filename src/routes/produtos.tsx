import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, Selo, SeloLegenda } from "@/components/cgs/ui-bits";
import { brl, LOJAS, PRODUTOS, SELOS, seloPorPreco } from "@/lib/cgs-data";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Cadastro de produtos de perfumaria com selo e pontuação calculados automaticamente pelo preço." },
      { property: "og:title", content: "Produtos · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Cadastro de produtos com selo automático por faixa de preço." },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const [busca, setBusca] = useState("");
  const [loja, setLoja] = useState("Todas");
  const [preco, setPreco] = useState("2,00");

  const lista = useMemo(
    () =>
      PRODUTOS.filter(
        (p) =>
          (loja === "Todas" || p.loja === loja) &&
          (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
            p.ean.includes(busca)),
      ),
    [busca, loja],
  );

  const simulado = seloPorPreco(Number(preco.replace(".", "").replace(",", ".")) || 0);

  return (
    <>
      <PageHeader titulo="Cadastro de produtos" descricao="O número do selo e a pontuação são calculados automaticamente pelo preço." />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard titulo="Simulador de selo" className="lg:col-span-1">
          <label className="text-xs font-medium text-muted-foreground">Preço do produto (R$)</label>
          <input
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
            <Selo n={simulado} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Selo {simulado} — {SELOS[simulado - 1]?.nome}</p>
              <p className="text-xs text-muted-foreground">{SELOS[simulado - 1]?.faixa}</p>
              <p className="text-xs text-muted-foreground">Pontuação gerada: <strong>{simulado}</strong></p>
            </div>
          </div>
        </SectionCard>

        <SectionCard titulo="Faixas de preço e pontuação" className="lg:col-span-2">
          <SeloLegenda />
          <p className="mt-3 text-xs text-muted-foreground">
            Cada faixa define o número do selo (1 a 7) e a pontuação equivalente. Alterações de faixas são feitas pelo painel administrativo.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        titulo={`Produtos participantes (${lista.length})`}
        acao={
          <div className="flex flex-wrap items-center gap-2">
            <input
              placeholder="Buscar nome, código ou EAN"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-44 rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
            />
            <select
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
            >
              <option>Todas</option>
              {LOJAS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Cód. barras</th>
                <th className="py-2 pr-3">Produto</th>
                <th className="py-2 pr-3">Marca</th>
                <th className="py-2 pr-3">Categoria</th>
                <th className="py-2 pr-3">Preço</th>
                <th className="py-2 pr-3">Selo</th>
                <th className="py-2 pr-3">Pontos</th>
                <th className="py-2 pr-3">Estoque</th>
                <th className="py-2 pr-3">Loja</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const s = seloPorPreco(p.preco);
                return (
                  <tr key={p.codigo} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-mono text-xs">{p.codigo}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{p.ean}</td>
                    <td className="py-2.5 pr-3 font-medium">{p.nome}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.marca}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.categoria}</td>
                    <td className="py-2.5 pr-3">{brl(p.preco)}</td>
                    <td className="py-2.5 pr-3"><Selo n={s} size="sm" /></td>
                    <td className="py-2.5 pr-3 font-semibold">{s}</td>
                    <td className="py-2.5 pr-3">{p.estoque}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.loja}</td>
                    <td className="py-2.5 text-xs font-semibold">
                      <span className={p.ativo ? "text-selo-4" : "text-muted-foreground"}>{p.ativo ? "Ativo" : "Inativo"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
