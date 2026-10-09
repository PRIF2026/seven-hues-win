import { createFileRoute } from "@tanstack/react-router";

// Endpoint consumido pelo app "Cartela Digital CGS" (celular do associado).
// O associado se identifica com telefone + CPF; só os dados da própria cartela são retornados.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

export const Route = createFileRoute("/api/public/cartela")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: { telefone?: string; cpf?: string };
        try { body = await request.json(); } catch { return json({ error: "Requisição inválida." }, 400); }
        const tel = digits(body.telefone);
        const cpf = digits(body.cpf);
        if (tel.length < 10 || tel.length > 13 || cpf.length !== 11) {
          return json({ error: "Informe telefone e CPF válidos." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: clientes, error } = await supabaseAdmin.from("clientes").select("id, telefone, cpf");
        if (error) return json({ error: "Serviço indisponível." }, 500);
        const achado = (clientes ?? []).find((c) => {
          const t = digits(c.telefone);
          return digits(c.cpf) === cpf && t.length >= 10 && (t.endsWith(tel) || tel.endsWith(t));
        });
        if (!achado) return json({ error: "Associado não encontrado." }, 404);

        const [{ data: c }, { data: selos }] = await Promise.all([
          supabaseAdmin.from("clientes").select("nome, associado, carteira, pontos, programada, data_sorteada, numero_sorteado").eq("id", achado.id).single(),
          supabaseAdmin.from("selos_cliente").select("selo, data, created_at").eq("cliente_id", achado.id).order("created_at", { ascending: false }),
        ]);
        if (!c) return json({ error: "Associado não encontrado." }, 404);

        const meta = 50;
        return json({
          nome: c.nome,
          associado: c.associado,
          cartela: c.carteira,
          pontos: c.pontos,
          meta,
          faltam: Math.max(0, meta - c.pontos),
          programada: c.programada,
          data_sorteada: c.data_sorteada,
          numero_sorteado: c.numero_sorteado,
          selos: (selos ?? []).map((s) => ({ selo: s.selo, data: s.data, registrado_em: s.created_at })),
          atualizado_em: new Date().toISOString(),
        });
      },
    },
  },
});
