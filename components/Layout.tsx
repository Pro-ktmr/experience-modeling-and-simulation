import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import styles from "./Layout.module.css";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({
  children,
  title = "モデル化とシミュレーション体験ツール",
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="情報Ⅰのモデル化とシミュレーションを体験する学習ツール" />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            モデル化とシミュレーション
          </Link>
          <nav className={styles.navigation} aria-label="ページ一覧">
            <Link href="/static-model">静的モデル</Link>
            <Link href="/deterministic">動的モデル：確定的モデル</Link>
            <Link href="/probabilistic">動的モデル：確率的モデル</Link>
          </nav>
        </div>
      </header>
      <main className={styles.pageShell}>{children}</main>
      <footer className={styles.footer}>情報Ⅰ　モデル化とシミュレーション体験ツール</footer>
    </>
  );
}
