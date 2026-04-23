export type Categoria = "venda" | "servico" | "recorrente" | "outro";

export type Pagamento =
  | "dinheiro"
  | "pix"
  | "cartao_debito"
  | "cartao_credito"
  | "boleto"
  | "transferencia";

export interface Entrada {
  id: string;
  data: string;
  descricao: string;
  categoria: Categoria;
  pagamento: Pagamento;
  valor: number;
}

const CATEGORIAS: readonly Categoria[] = [
  "venda",
  "servico",
  "recorrente",
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

function isCategoria(v: string): v is Categoria {
  return (CATEGORIAS as readonly string[]).includes(v);
}

function isPagamento(v: string): v is Pagamento {
  return (PAGAMENTOS as readonly string[]).includes(v);
}

export function parseCSV(text: string): Entrada[] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const out: Entrada[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = splitCsvLine(lines[i]);
    if (raw.length < 5) continue;

    const [data, descricaoRaw, categoriaRaw, pagamentoRaw, valorRaw] = raw;
    const descricao = unquoteCell(descricaoRaw);
    const categoria = categoriaRaw.trim();
    const pagamento = pagamentoRaw.trim();
    const valor = Number(String(valorRaw).replace(",", ".").trim());

    if (!isCategoria(categoria) || !isPagamento(pagamento)) continue;
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

export function toCSV(entries: Entrada[]): string {
  const header = "data,descricao,categoria,pagamento,valor";
  const body = entries.map((e) => {
    const desc =
      /[",\n\r]/.test(e.descricao) || e.descricao.includes(",")
        ? `"${e.descricao.replace(/"/g, '""')}"`
        : e.descricao;
    return `${e.data},${desc},${e.categoria},${e.pagamento},${e.valor.toFixed(2)}`;
  });
  return `\uFEFF${[header, ...body].join("\n")}`;
}

export function sortEntradasPorData(entries: Entrada[]): Entrada[] {
  return [...entries].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
}

export const LABEL_CATEGORIA: Record<Categoria, string> = {
  venda: "Venda",
  servico: "Serviço",
  recorrente: "Recorrente",
  outro: "Outro",
};

export const LABEL_PAGAMENTO: Record<Pagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao_debito: "Cartão débito",
  cartao_credito: "Cartão crédito",
  boleto: "Boleto",
  transferencia: "Transferência",
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const DEMO_ENTRIES: Entrada[] = sortEntradasPorData([
  {
    id: "demo-1",
    data: "2025-04-18",
    descricao: "Venda Kit Premium — Maria Silva",
    categoria: "venda",
    pagamento: "pix",
    valor: 580,
  },
  {
    id: "demo-2",
    data: "2025-03-28",
    descricao: "Consultoria mensal",
    categoria: "servico",
    pagamento: "transferencia",
    valor: 1200,
  },
  {
    id: "demo-3",
    data: "2025-03-05",
    descricao: "Assinatura software",
    categoria: "recorrente",
    pagamento: "cartao_credito",
    valor: 149.9,
  },
  {
    id: "demo-4",
    data: "2025-02-14",
    descricao: "Venda avulsa — balcão",
    categoria: "venda",
    pagamento: "dinheiro",
    valor: 120,
  },
]);
