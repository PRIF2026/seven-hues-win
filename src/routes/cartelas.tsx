import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ProgressoPontos, SectionCard, Selo, StatusPill } from "@/components/cgs/ui-bits";
import { brl, CLIENTES, dataBr, MINIMO_VALOR_CARTELA, SELOS, type SeloNumber } from "@/lib/cgs-data";

export const Route = createFileRoute("/cartelas")({
  head: () => ({
    meta: [
      { title: "Cartelas · PROJETO 7 CORES – CGS" },
      { name: "description", content: "Cartela digital com selos de 1 a 7, pontos acumulados, status e data programada de sorteio." },
      { property: "og:title", content: "Cartelas · PROJETO 7 CORES – CGS" },
      { property: "og:description", content: "Cartela digital com selos de 1 a 7 e progresso até 50 pontos." },
    ],
  }),
  component: Cartelas,
});

const STATUS = ["Todas", "Em andamento", "Pronta para sorteio", "Sorteada", "Premiada", "Prêmio recebido", "Expirada", "Cancelada"];

function Cartelas() {
  const [filtro, setFiltro] = useState("Todas");
  const lista = CLIENTES.filter((c) => filtro === "Todas" || c.status === filtro);

  return (
    <>
      <PageHeader
        titulo="Cartela digital"
        descricao="Meta de 50 pontos."
        acoes={
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((c) => {
          const contagem = SELOS.map((s) => c.selos.filter((x) => x === s.n).length);
          const meta = c.pontos >= 50;
          const valorOk = c.valorGasto >= MINIMO_VALOR_CARTELA;
          return (
            <article key={c.id} className="card-soft overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-1.5 w-full rainbow-bar" />
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-foreground">{c.nome}</h2>
                    <p className="truncate text-xs text-muted-foreground">{c.carteira} · criada em {dataBr(c.cadastro)}</p>
                  </div>
                  <StatusPill status={meta ? "Premiada" : c.status} />
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {SELOS.map((s, i) => (
                    <div key={s.n} className="flex flex-col items-center gap-1">
                      <Selo n={s.n as SeloNumber} faded={contagem[i] === 0} />
                      <span className="text-[10px] font-semibold text-muted-foreground">x{contagem[i]}</span>
                    </div>
                  ))}
                </div>

                <ProgressoPontos pontos={c.pontos} />

                <p className={valorOk
                  ? "rounded-md bg-selo-4/12 px-2 py-1.5 text-xs font-medium text-selo-4"
                  : "rounded-md bg-selo-1/12 px-2 py-1.5 text-xs font-medium text-selo-1"}>
                  Somatório em produtos: {brl(c.valorGasto)} ·{" "}
                  {valorOk
                    ? `mínimo de ${brl(MINIMO_VALOR_CARTELA)} atingido`
                    : `faltam ${brl(MINIMO_VALOR_CARTELA - c.valorGasto)} para o mínimo de ${brl(MINIMO_VALOR_CARTELA)}`}
                </p>

                {meta ? (
                  <p className="rounded-md bg-selo-4/15 px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-selo-4">
                    Meta atingida
                  </p>
                ) : (
                  <p className="rounded-md bg-muted px-2 py-1.5 text-center text-xs text-muted-foreground">
                    Faltam {50 - c.pontos} pontos para a meta de 50
                  </p>
                )}

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Selos</dt><dd className="font-semibold text-foreground">{c.selos.length}</dd></div>
                  <div><dt className="text-muted-foreground">Restantes</dt><dd className="font-semibold text-foreground">{Math.max(0, 50 - c.pontos)} pts</dd></div>
                  <div><dt className="text-muted-foreground">Data sorteada</dt><dd className="font-semibold text-foreground">{dataBr(c.dataSorteada)}</dd></div>
                  <div><dt className="text-muted-foreground">Nº sorteado</dt><dd className="font-semibold text-foreground">{c.numeroSorteado ?? "—"}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
