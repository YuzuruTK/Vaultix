import type { MetaFunction } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";

import { MetricCard } from "~/components/MetricCard";
import { ToastProvider, useToast } from "~/components/Toast";
import { formatBRL, LABEL_PAGAMENTO, type Pagamento } from "~/lib/csv";
import type { CategoriaSaida, Saida } from "~/lib/csv-saidas";
import {
  DEMO_SAIDAS,
  LABEL_CATEGORIA_SAIDA,
  parseCSVSaidas,
  sortSaidasPorData,
  toCSVSaidas,
} from "~/lib/csv-saidas";

export const meta: MetaFunction = () => [{ title: "Saídas — Caixa App" }];

function monthKeyFromData(data: string): string {
  return data.slice(0, 7);
}

function SaidasInner() {
  const { show } = useToast();

  const [rows, setRows] = useState<Saida[]>(DEMO_SAIDAS);
  const [filterMes, setFilterMes] = useState("");
  const [filterCat, setFilterCat] = useState<string>("");

  const [formData, setFormData] = useState({
    data: new Date().toISOString().slice(0, 10),
    descricao: "",
    categoria: "fornecedor" as CategoriaSaida,
    pagamento: "pix" as Pagamento,
    valor: "",
  });

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of rows) {
      set.add(monthKeyFromData(e.data));
    }
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((e) => {
      if (filterMes && monthKeyFromData(e.data) !== filterMes) return false;
      if (filterCat && e.categoria !== filterCat) return false;
      return true;
    });
  }, [rows, filterMes, filterCat]);

  const metrics = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.valor, 0);
    const count = filtered.length;
    const months = new Set(filtered.map((e) => monthKeyFromData(e.data)));
    const monthCount = Math.max(months.size, 1);
    const mediaMensal = total / monthCount;
    const ticketMedio = count > 0 ? total / count : 0;
    const maior = count > 0 ? Math.max(...filtered.map((e) => e.valor)) : 0;
    return {
      total,
      mediaMensal,
      ticketMedio,
      maior,
      count,
      monthCount,
    };
  }, [filtered]);

  const chartData = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const e of filtered) {
      const k = monthKeyFromData(e.data);
      byMonth.set(k, (byMonth.get(k) ?? 0) + e.valor);
    }
    const list = Array.from(byMonth.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0
    );
    const maxVal = Math.max(...list.map(([, v]) => v), 1);
    return list.map(([mes, valor]) => ({
      mes,
      valor,
      pct: Math.round((valor / maxVal) * 100),
    }));
  }, [filtered]);

  const addSaida = useCallback(() => {
    const valorNum = Number(String(formData.valor).replace(",", "."));
    if (!formData.descricao.trim()) {
      show("Informe uma descrição.");
      return;
    }
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      show("Valor inválido.");
      return;
    }
    const novo: Saida = {
      id: String(Date.now()),
      data: formData.data,
      descricao: formData.descricao.trim(),
      categoria: formData.categoria,
      pagamento: formData.pagamento,
      valor: valorNum,
    };
    setRows((prev) => sortSaidasPorData([novo, ...prev]));
    setFormData((f) => ({
      ...f,
      descricao: "",
      valor: "",
    }));
    show("Saída registrada.");
  }, [formData, show]);

  const deleteSaida = useCallback(
    (id: string) => {
      setRows((prev) => prev.filter((e) => e.id !== id));
      show("Registro removido.");
    },
    [show]
  );

  const exportCSV = useCallback(() => {
    const csv = toCSVSaidas(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saidas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show("Exportação concluída.");
  }, [rows, show]);

  const importCSV = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        const parsed = parseCSVSaidas(text);
        if (parsed.length === 0) {
          show("Nenhuma linha válida no CSV.");
          return;
        }
        setRows((prev) => sortSaidasPorData([...parsed, ...prev]));
        show(`${parsed.length} registro(s) importados.`);
      };
      reader.onerror = () => show("Erro ao ler o arquivo.");
      reader.readAsText(file, "UTF-8");
    },
    [show]
  );

  return (
    <>
      <h1 className="page-title">Saídas de caixa</h1>
      <p className="page-lead">
        Registre despesas e pagamentos, filtre por período e categoria, e use
        CSV para backup ou integração com planilhas.
      </p>

      <section className="panel">
        <h2 className="panel__title">Métricas</h2>
        <div className="metrics-grid">
          <MetricCard label="Total (filtro)" value={formatBRL(metrics.total)} />
          <MetricCard
            label="Média mensal"
            value={formatBRL(metrics.mediaMensal)}
            sub={`${metrics.monthCount} mês(es) no período`}
          />
          <MetricCard
            label="Ticket médio"
            value={formatBRL(metrics.ticketMedio)}
            sub={`${metrics.count} lançamento(s)`}
          />
          <MetricCard
            label="Maior saída"
            value={formatBRL(metrics.maior)}
          />
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Por mês (filtro atual)</h2>
        {chartData.length === 0 ? (
          <p style={{ color: "var(--text-2)", margin: 0 }}>
            Sem dados para o filtro selecionado.
          </p>
        ) : (
          <div className="chart">
            {chartData.map((row) => (
              <div key={row.mes} className="chart-row">
                <span className="chart-row__label">{row.mes}</span>
                <div className="chart-row__track">
                  <div
                    className="chart-row__fill chart-row__fill--saida"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="chart-row__val">{formatBRL(row.valor)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">Filtros</h2>
        <div className="filters-row">
          <div className="field">
            <label htmlFor="s-filter-mes">Mês</label>
            <select
              id="s-filter-mes"
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
            >
              <option value="">Todos</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-filter-cat">Categoria</label>
            <select
              id="s-filter-cat"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="">Todas</option>
              {(Object.keys(LABEL_CATEGORIA_SAIDA) as CategoriaSaida[]).map(
                (c) => (
                  <option key={c} value={c}>
                    {LABEL_CATEGORIA_SAIDA[c]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Novo lançamento</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="s-f-data">Data</label>
            <input
              id="s-f-data"
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData((f) => ({ ...f, data: e.target.value }))
              }
            />
          </div>
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label htmlFor="s-f-desc">Descrição</label>
            <input
              id="s-f-desc"
              type="text"
              value={formData.descricao}
              placeholder="Ex.: Aluguel do galpão"
              onChange={(e) =>
                setFormData((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="s-f-cat">Categoria</label>
            <select
              id="s-f-cat"
              value={formData.categoria}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  categoria: e.target.value as CategoriaSaida,
                }))
              }
            >
              {(Object.keys(LABEL_CATEGORIA_SAIDA) as CategoriaSaida[]).map(
                (c) => (
                  <option key={c} value={c}>
                    {LABEL_CATEGORIA_SAIDA[c]}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-f-pag">Pagamento</label>
            <select
              id="s-f-pag"
              value={formData.pagamento}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  pagamento: e.target.value as Pagamento,
                }))
              }
            >
              {(Object.keys(LABEL_PAGAMENTO) as Pagamento[]).map((p) => (
                <option key={p} value={p}>
                  {LABEL_PAGAMENTO[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-f-valor">Valor (R$)</label>
            <input
              id="s-f-valor"
              type="number"
              min={0}
              step="0.01"
              value={formData.valor}
              onChange={(e) =>
                setFormData((f) => ({ ...f, valor: e.target.value }))
              }
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={addSaida}
          >
            Adicionar
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Importar / exportar</h2>
        <div className="toolbar">
          <input
            type="file"
            accept=".csv,text/csv"
            className="file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCSV(f);
              e.target.value = "";
            }}
          />
          <button type="button" className="btn btn--ghost" onClick={exportCSV}>
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Lançamentos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Pagamento</th>
                <th style={{ textAlign: "right" }}>Valor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: "var(--text-2)" }}>
                    Nenhum lançamento para os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="num">{e.data}</td>
                    <td>{e.descricao}</td>
                    <td>
                      <span className={`badge badge-saida-${e.categoria}`}>
                        {LABEL_CATEGORIA_SAIDA[e.categoria]}
                      </span>
                    </td>
                    <td>{LABEL_PAGAMENTO[e.pagamento]}</td>
                    <td className="num">{formatBRL(e.valor)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => deleteSaida(e.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function SaidasRoute() {
  return (
    <ToastProvider>
      <SaidasInner />
    </ToastProvider>
  );
}
