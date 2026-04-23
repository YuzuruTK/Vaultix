import type { Pagamento } from "~/lib/csv";

export type CategoriaSaida =
  | "fornecedor"
  | "folha"
  | "imposto"
  | "infraestrutura"
  | "marketing"
  | "outro";

export interface Saida {
  id: string;
  data: string;
  descricao: string;
  categoria: CategoriaSaida;
  pagamento: Pagamento;
  valor: number;
}

const CATEGORIAS: readonly CategoriaSaida[] = [
  "fornecedor",
  "folha",
  "imposto",
  "infraestrutura",
  "marketing",
  "outro",
] as const;

const PAGAMENTOS: readonly Pagamento[] = [
  "dinheiro",
  "pix",
  "cartao_debito",
  "cartao_credito",
  "boleto",
  "transferencia",
] as const;

const CELL_REGEX = /(".*?"|[^,]+)(?=,|$)/g;

function splitCsvLine(line: string): string[] {
  const matches = line.match(CELL_REGEX);
  return matches ? matches.map((c) => c.trim()) : [];
}

function unquoteCell(cell: string): string {
  if (cell.startsWith('"') && cell.endsWith('"')) {
    return cell.slice(1, -1).replace(/""/g, '"');
  }
  return cell;
}

function isCategoriaSaida(v: string): v is CategoriaSaida {
  return (CATEGORIAS as readonly string[]).includes(v);
}

function isPagamento(v: string): v is Pagamento {
  return (PAGAMENTOS as readonly string[]).includes(v);
}

export function parseCSVSaidas(text: string): Saida[] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const out: Saida[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = splitCsvLine(lines[i]);
    if (raw.length < 5) continue;

    const [data, descricaoRaw, categoriaRaw, pagamentoRaw, valorRaw] = raw;
    const descricao = unquoteCell(descricaoRaw);
    const categoria = categoriaRaw.trim();
    const pagamento = pagamentoRaw.trim();
    const valor = Number(String(valorRaw).replace(",", ".").trim());

    if (!isCategoriaSaida(categoria) || !isPagamento(pagamento)) continue;
    if (!Number.isFinite(valor)) continue;

    out.push({
      id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
      data: data.trim(),
      descricao,
      categoria,
      pagamento,
      valor,
    });
  }
  return out;
}

export function toCSVSaidas(rows: Saida[]): string {
  const header = "data,descricao,categoria,pagamento,valor";
  const body = rows.map((e) => {
    const desc =
      /[",\n\r]/.test(e.descricao) || e.descricao.includes(",")
        ? `"${e.descricao.replace(/"/g, '""')}"`
        : e.descricao;
    return `${e.data},${desc},${e.categoria},${e.pagamento},${e.valor.toFixed(2)}`;
  });
  return `\uFEFF${[header, ...body].join("\n")}`;
}

export function sortSaidasPorData(rows: Saida[]): Saida[] {
  return [...rows].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
}

export const LABEL_CATEGORIA_SAIDA: Record<CategoriaSaida, string> = {
  fornecedor: "Fornecedor",
  folha: "Folha / pessoal",
  imposto: "Impostos / taxas",
  infraestrutura: "Infraestrutura",
  marketing: "Marketing",
  outro: "Outro",
};

export const DEMO_SAIDAS: Saida[] = sortSaidasPorData([
  {
    id: "s-demo-1",
    data: "2025-04-10",
    descricao: "Matéria-prima — Fornecedor ABC",
    categoria: "fornecedor",
    pagamento: "boleto",
    valor: 920,
  },
  {
    id: "s-demo-2",
    data: "2025-04-05",
    descricao: "Folha de pagamento abril",
    categoria: "folha",
    pagamento: "transferencia",
    valor: 4800,
  },
  {
    id: "s-demo-3",
    data: "2025-03-22",
    descricao: "DAS / guias municipais",
    categoria: "imposto",
    pagamento: "pix",
    valor: 412.5,
  },
  {
    id: "s-demo-4",
    data: "2025-03-01",
    descricao: "Hospedagem e domínio",
    categoria: "infraestrutura",
    pagamento: "cartao_credito",
    valor: 189.9,
  },
]);
