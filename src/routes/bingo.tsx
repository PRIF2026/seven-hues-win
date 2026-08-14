import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard, StatusPill } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, dataBr, elegibilidade, META_PONTOS, MINIMO_VALOR_CARTELA, MINIMO_VALOR_CARTELA_PADRAO, type ModoSorteio, SORTEIOS, VALORES_DIA_PADRAO } from "@/lib/cgs-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bingo")({
  head: () => ({
    meta: [
      { title: "Bingo · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Módulo de bingo: o cliente sorteia um número que corresponde a um dia do mês seguinte e ao valor do prêmio." },
      { property: "og:title", content: "Bingo · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Sorteio de números correspondentes aos dias do calendário e seus prêmios." },
    ],
  }),
  component: Bingo,
});

const diasDoMes = (mes: number, ano: number) => new Date(ano, mes, 0).getDate();

function Bingo() {
  const [clienteId, setClienteId] = useState(CLIENTES[1]!.id);
  const [numero, setNumero] = useState<number | null>(null);
  const [girando, setGirando] = useState(false);
  const [modo, setModo] = useState<ModoSorteio>("50-pontos");

  const cliente = CLIENTES.find((c) => c.id === clienteId)!;
  const apto = elegibilidade(cliente.pontos, cliente.valorGasto);
  const habilitado = modo === "50-pontos" ? apto.meta : apto.programada;
  const total = diasDoMes(9, 2026);
  const valor = numero ? (VALORES_DIA_PADRAO[numero] ?? 0) : 0;

  const sortear = () => {
    if (!habilitado || girando) return;
    setGirando(true);
    let i = 0;
    const t = setInterval(() => {
      setNumero(Math.floor(Math.random() * total) + 1);
      if (++i > 14) {
        clearInterval(t);
        setGirando(false);
      }
    }, 70);
  };

  return (
    <>
      <PageHeader titulo="Bingo dos dias" descricao="Mês de referência: setembro/2026 — o número sorteado corresponde ao dia do mês seguinte." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard titulo={`Cartela de números · ${total} dias no mês de referência`}>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-10">
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setNumero(n)}
                className={cn(
                  "aspect-square rounded-lg border text-sm font-display font-bold transition-transform hover:scale-105",
                  n === numero
                    ? "border-transparent text-white shadow-lg"
                    : "border-border bg-card text-foreground",
                )}
                style={n === numero ? { background: `var(--selo-${(n % 7) + 1})` } : undefined}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Dias 29, 30 e 31 são desabilitados automaticamente em meses que não os possuem.
          </p>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard titulo="Sortear número">
            <label className="text-xs font-medium text-muted-foreground">Cliente / cartela</label>
            <select
              value={clienteId}
              onChange={(e) => { setClienteId(e.target.value); setNumero(null); }}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {CLIENTES.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.pontos} pts · {brl(c.valorGasto)}</option>
              ))}
            </select>

            <fieldset className="mt-4 space-y-2">
              <legend className="text-xs font-medium text-muted-foreground">Modalidade do sorteio</legend>
              {([
                { v: "50-pontos" as ModoSorteio, t: `${META_PONTOS} pontos`, d: `meta de ${META_PONTOS} pontos e ${brl(MINIMO_VALOR_CARTELA_PADRAO)} somados`, ok: apto.meta },
                { v: "programada" as ModoSorteio, t: "Cartela programada", d: `mínimo de ${brl(MINIMO_VALOR_CARTELA)} em valor somado`, ok: apto.programada },
              ]).map((o) => (
                <label
                  key={o.v}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-xs ${modo === o.v ? "border-primary bg-accent" : "border-border"}`}
                >
                  <input type="radio" name="modo" className="mt-0.5" checked={modo === o.v} onChange={() => setModo(o.v)} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{o.t}</span>
                    <span className="block text-muted-foreground">{o.d}</span>
                    <span className={o.ok ? "font-semibold text-selo-4" : "font-semibold text-selo-1"}>
                      {o.ok ? "cliente enquadrado" : "cliente não enquadrado"}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-4 grid place-items-center rounded-xl border border-border p-6">
              <span
                className="grid h-28 w-28 place-items-center rounded-full font-display text-4xl font-bold text-white"
                style={{ background: numero ? `var(--selo-${(numero % 7) + 1})` : "var(--muted)" }}
              >
                {numero ?? "—"}
              </span>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {numero ? <>Dia {numero} de 09/2026 · prêmio <strong className="text-foreground">{brl(valor)}</strong></> : "Nenhum número sorteado"}
              </p>
            </div>

            {!habilitado ? (
              <p className="mt-3 rounded-md bg-selo-1/12 px-2 py-2 text-xs font-medium text-selo-1">
                Sem sorteio nesta modalidade. {modo === "50-pontos"
                  ? `Exige ${META_PONTOS} pontos e ${brl(MINIMO_VALOR_CARTELA_PADRAO)} somados${cliente.pontos < META_PONTOS ? ` (faltam ${META_PONTOS - cliente.pontos} pontos)` : ""}.`
                  : `A cartela programada exige ${brl(MINIMO_VALOR_CARTELA)} somados (faltam ${brl(Math.max(0, MINIMO_VALOR_CARTELA - cliente.valorGasto))}).`}
              </p>
            ) : null}

            <button
              onClick={sortear}
              disabled={!habilitado || girando}
              className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {girando ? "Sorteando..." : "Sortear número"}
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              O cliente deve apresentar a cartela exatamente na data sorteada, sob pena de perda do prêmio.
              {modo === "programada" ? ` Na cartela programada é preciso completar os ${META_PONTOS} pontos até o dia sorteado; em caso de desistência, todos os pontos são perdidos.` : ""}
            </p>
          </SectionCard>
        </div>
      </div>

      <SectionCard titulo="Registro de sorteios">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Cliente</th><th className="py-2 pr-3">Cartela</th>
                <th className="py-2 pr-3">Nº</th><th className="py-2 pr-3">Data do sorteio</th><th className="py-2 pr-3">Mês ref.</th>
                <th className="py-2 pr-3">Valor do dia</th><th className="py-2 pr-3">Ganhadores</th><th className="py-2 pr-3">Valor individual</th>
                <th className="py-2 pr-3">Previsão</th><th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {SORTEIOS.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{s.id}</td>
                  <td className="py-2.5 pr-3">{s.cliente}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{s.carteira}</td>
                  <td className="py-2.5 pr-3 font-display font-bold">{s.numero}</td>
                  <td className="py-2.5 pr-3">{dataBr(s.dataSorteio)}</td>
                  <td className="py-2.5 pr-3">{s.mesReferencia}</td>
                  <td className="py-2.5 pr-3">{brl(s.valorOriginal)}</td>
                  <td className="py-2.5 pr-3">{s.ganhadores}</td>
                  <td className="py-2.5 pr-3 font-semibold">{brl(s.valorOriginal / s.ganhadores)}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{dataBr(s.previsaoPagamento)}</td>
                  <td className="py-2.5"><StatusPill status={s.statusPremio} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
