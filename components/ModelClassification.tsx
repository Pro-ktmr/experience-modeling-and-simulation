import Link from "next/link";
import styles from "./ModelClassification.module.css";

const destinations = {
  static: {
    href: "/static-model",
    name: "静的モデル",
    description: "時間の経過を扱わない",
  },
  deterministic: {
    href: "/deterministic",
    name: "確定的モデル",
    description: "不確実な要素を含まない",
  },
  probabilistic: {
    href: "/probabilistic",
    name: "確率的モデル",
    description: "不確実な要素を含む",
  },
};

function ModelLink({
  destination,
}: {
  destination: (typeof destinations)[keyof typeof destinations];
}) {
  return (
    <Link className={styles.link} href={destination.href}>
      <strong>{destination.name}</strong>
      <span>{destination.description}</span>
      <b>体験する →</b>
    </Link>
  );
}

export default function ModelClassification() {
  return (
    <section
      className={`${styles.classification} card`}
      aria-labelledby="model-classification-title"
    >
      <h2 id="model-classification-title">モデルの分類</h2>
      <p className={styles.lead}>
        モデルは、時間の経過を扱うかどうかで、静的モデルと動的モデルに分類できます。
        <br />
        動的モデルはさらに、不確実な要素を含むかどうかで、確定的モデルと確率的モデルに分類できます。
      </p>

      <div className={styles.tree}>
        <div className={styles.treeContent}>
          <div className={styles.root}>モデル</div>
          <div className={styles.branches}>
            <div className={styles.branch}>
              <ModelLink destination={destinations.static} />
            </div>
            <div className={`${styles.branch} ${styles.dynamic}`}>
              <div className={styles.parent}>
                <strong>動的モデル</strong>
                <span>時間の経過を扱う</span>
              </div>
              <div className={styles.children}>
                <ModelLink destination={destinations.deterministic} />
                <ModelLink destination={destinations.probabilistic} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
