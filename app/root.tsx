import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import appStyles from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStyles },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap",
  },
];

export const meta: MetaFunction = () => [
  { title: "Vaultix" },
  { name: "description", content: "Track income, manage expenses, and analyze your financial data" },
  { name: "color-scheme", content: "light dark" },
];

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <span className="site-logo">Vaultix</span>
            <nav className="site-nav">
              <NavLink
                to="/entradas"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Entradas
              </NavLink>
              <NavLink
                to="/saidas"
                className={({ isActive }) =>
                  isActive ? "site-nav__link active" : "site-nav__link"
                }
              >
                Saídas
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="site-main">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
