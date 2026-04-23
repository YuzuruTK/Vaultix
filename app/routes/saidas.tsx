import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Saídas — Caixa App" }];

export default function SaidasRoute() {
  return (
    <div className="placeholder-page">
      <h1 className="page-title">Saídas</h1>
      <p className="page-lead">
        Este módulo ainda não foi implementado. Em breve você poderá registrar
        e analisar as saídas de caixa da mesma forma que as entradas.
      </p>
    </div>
  );
}
