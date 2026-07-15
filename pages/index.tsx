import Layout from "@/components/Layout";
import ModelClassification from "@/components/ModelClassification";

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">情報Ⅰ　体験ツール</p>
        <h1>
          モデル化と
          <br />
          <span>シミュレーション</span>
        </h1>
      </section>
      <section className="intro card">
        <h2>モデルとは？</h2>
        <p>
          <strong>モデル</strong>
          とは、実際の物や事象について、簡略化して表現したものです。路線図、模型、数式などはいずれもモデルの例です。細かい情報を省くことで、本質的で重要な部分だけに着目します。
        </p>
        <h2>シミュレーションとは？</h2>
        <p>
          <strong>シミュレーション</strong>
          とは、モデルを使って事象を試行することです。安全性や費用などの面で実際と同じ条件で実施することが難しい場合も、モデルを用いることで事象を簡単に試行できます。
        </p>
      </section>
      <ModelClassification />
    </Layout>
  );
}
