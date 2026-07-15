import Layout from "@/components/Layout";
import carImage from "@/public/images/car.png";
import classroomImage from "@/public/images/classroom.png";
import seatingCharImage from "@/public/images/seating-chart.png";
import toyCarImage from "@/public/images/toy-car.png";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

type QuizCardProps = {
  number: string;
  title: string;
  prompt: string;
  questionImage: StaticImageData;
  answerImage: StaticImageData;
  answerTitle: string;
  explanation: string;
};

function QuizCard({
  number,
  title,
  prompt,
  questionImage,
  answerImage,
  answerTitle,
  explanation,
}: QuizCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!isOpening) return;

    const timer = window.setTimeout(() => {
      setRevealed(true);
      setIsOpening(false);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [isOpening]);

  return (
    <section className="quiz-card card">
      <div className="quiz-copy">
        <p className="eyebrow">MODEL QUIZ {number}</p>
        <h2>{title}</h2>
        <p>{prompt}</p>
      </div>
      <div className="quiz-visual">
        <div className="quiz-question-image">
          <Image src={questionImage} alt={`${title}のもとのようす`} fill sizes="(max-width: 720px) 100vw, 30vw" />
        </div>
        <span className="quiz-arrow" aria-hidden="true">
          →
        </span>
        <div className="quiz-answer">
          <div className="quiz-answer-image">
            <Image src={answerImage} alt={`${answerTitle}のイラスト`} fill sizes="(max-width: 720px) 100vw, 30vw" />
          </div>
          <div className="quiz-answer-copy">
            <h3>{answerTitle}</h3>
            <p>{explanation}</p>
          </div>
        </div>
        {!revealed && (
          <button
            className={`cloud-button ${isOpening ? "is-opening" : ""}`}
            onClick={() => setIsOpening(true)}
            type="button"
            aria-expanded={revealed}
            disabled={isOpening}
          >
            クリックして答えを見る
          </button>
        )}
      </div>
    </section>
  );
}

export default function StaticModel() {
  return (
    <Layout title="静的モデル | モデル化とシミュレーション">
      <section className="page-hero">
        <p className="eyebrow">STATIC MODEL</p>
        <h1>静的モデル</h1>
        <p>
          静的モデルは、<strong>時間の経過を扱わない</strong>モデルです。
        </p>
      </section>

      <QuizCard
        number="01"
        title="教室"
        prompt="教室の情報から、誰がどこに座っているかという重要な情報だけを取り出すと、どのようなモデルになるでしょうか？"
        questionImage={classroomImage}
        answerImage={seatingCharImage}
        answerTitle="座席表"
        explanation="座席表は、教室内の座席の配置という情報を残しながら、それ以外は省いて表したモデルです。"
      />
      <QuizCard
        number="02"
        title="自動車"
        prompt="自動車の見た目の情報だけを取り出し、手のひらサイズで持ち歩けるようにすると、どのようなモデルになるでしょうか？"
        questionImage={carImage}
        answerImage={toyCarImage}
        answerTitle="ミニカー"
        explanation="ミニカーは、自動車の外形などの特徴を残しながら、大きさや細部を省いて表したモデルです。"
      />

      <article className="reading card">
        <h2>ポイント</h2>
        <p>
          モデルには、座席表のように図や表を用いる<strong>論理モデル</strong>
          や、ミニカーのように実物を模した<strong>物理モデル</strong>などがあります。
        </p>
      </article>
    </Layout>
  );
}
