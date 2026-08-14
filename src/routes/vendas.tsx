import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, Selo } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, dataBr, LOJAS, MINIMO_VALOR_CARTELA, PRODUTOS, VENDAS, pontosDaVenda, seloPorPreco, type Venda } from "@/lib/cgs-data";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Registro de vendas com cálculo automático de selos e pontos, incluindo a regra de 4+ unidades." },
      { property: "og:title", content: "Vendas · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Registro de vendas com cálculo automático de selos e pontos." },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>(VENDAS);
  const [produto, setProduto] = useState(PRODUTOS[0]!.codigo);
  const [qtd, setQtd] = useState(1);
  const [cliente, setCliente] = useState(CLIENTES[0]!.nome);
  const [loja, setLoja] = useState(LOJAS[0]!);

  const p = PRODUTOS.find((x) => x.codigo === produto)!;
  const selo = seloPorPreco(p.preco);
  const pontos = qtd >= 4 ? selo : selo * qtd;
  const total = p.preco * qtd;

  const totais = useMemo(
    () => ({
      valor: vendas.reduce((a, v) => a + v.unitario * v.qtd, 0),
      pontos: vendas.reduce((a, v) => a + pontosDaVenda(v), 0),
    }),
    [vendas],
  );

  const registrar = () => {
    const agora = new Date();
    const nova: Venda = {
      id: `V-${9000 + vendas.length + 1}`,
      data: agora.toISOString().slice(0, 10),
      hora: agora.toTimeString().slice(0, 5),
      loja,
      funcionario: "Operador logado",
      cliente,
      produto: p.nome,
      qtd,
      unitario: p.preco,
      selo,
    };
    setVendas((prev) => [nova, ...prev]);
    setQtd(1);
  };

  return (
    <>
      <PageHeader titulo="Controle de vendas" descricao="Fluxo: venda → produto → selo → pontos → cartela." />

      <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <SectionCard titulo="Nova venda">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cliente</label>
              <select value={cliente} onChange={(e) => setCliente(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {CLIENTES.map((c) => <option key={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Loja / filial</label>
              <select value={loja} onChange={(e) => setLoja(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {LOJAS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Produto</label>
              <select value={produto} onChange={(e) => setProduto(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {PRODUTOS.map((x) => (
                  <option key={x.codigo} value={x.codigo}>{x.nome} — {brl(x.preco)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quantidade</label>
              <input type="number" min={1} value={qtd} onChange={(e) => setQtd(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Selo n={selo} size="lg" />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-foreground">Total {brl(total)}</p>
                  <p className="text-muted-foreground">Pontuação gerada: <strong className="text-foreground">{pontos}</strong></p>
                </div>
              </div>
              {qtd >= 4 ? (
                <p className="mt-3 rounded-md bg-selo-3/25 px-2 py-1.5 text-xs font-medium text-foreground">
                  Regra aplicada: 4 ou mais unidades do mesmo produto na mesma compra contabilizam apenas 1 selo.
                </p>
              ) : null}
              <p className="mt-2 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
                A cartela precisa somar no mínimo {brl(MINIMO_VALOR_CARTELA)} em produtos para valer no sorteio.
              </p>
            </div>

            <button onClick={registrar} className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              Registrar venda e lançar selo
            </button>
          </div>
        </SectionCard>

        <SectionCard titulo={`Vendas registradas · ${brl(totais.valor)} · ${totais.pontos} pontos`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3">Venda</th><th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Hora</th>
                  <th className="py-2 pr-3">Loja</th><th className="py-2 pr-3">Funcionário</th><th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Produto</th><th className="py-2 pr-3">Qtd</th><th className="py-2 pr-3">Unit.</th>
                  <th className="py-2 pr-3">Total</th><th className="py-2 pr-3">Selo</th><th className="py-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
              {vendas.map((v) => (
                  <tr key={v.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-mono text-xs">{v.id}</td>
                    <td className="py-2.5 pr-3">{dataBr(v.data)}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{v.hora}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{v.loja}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{v.funcionario}</td>
                    <td className="py-2.5 pr-3">{v.cliente}</td>
                    <td className="py-2.5 pr-3">{v.produto}</td>
                    <td className="py-2.5 pr-3">{v.qtd}</td>
                    <td className="py-2.5 pr-3">{brl(v.unitario)}</td>
                    <td className="py-2.5 pr-3 font-medium">{brl(v.unitario * v.qtd)}</td>
                    <td className="py-2.5 pr-3"><Selo n={v.selo} size="sm" /></td>
                    <td className="py-2.5 font-semibold">{pontosDaVenda(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
