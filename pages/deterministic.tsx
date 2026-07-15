import { InterestFrame, TankFrame } from "@/components/CanvasFrame";
import Layout from "@/components/Layout";
import SimulationStrip from "@/components/SimulationStrip";
import { readNumberInput } from "@/components/simulationUtils";
import { useState } from "react";

const INITIAL_TANK = { capacity: 20, amount: 0, inflow: 4 };
const INITIAL_INTEREST = { deposit: 10000, rate: 2 };

function createTankFrame(step: number, capacity: number, amount: number): TankFrame {
  return { kind: "tank", step, capacity, amount };
}

function createInterestFrame(step: number, balance: number): InterestFrame {
  return { kind: "interest", step, balance };
}

export default function Deterministic() {
  const [capacity, setCapacity] = useState(INITIAL_TANK.capacity);
  const [initialAmount, setInitialAmount] = useState(INITIAL_TANK.amount);
  const [inflow, setInflow] = useState(INITIAL_TANK.inflow);
  const [tankFrames, setTankFrames] = useState<TankFrame[]>([
    createTankFrame(0, INITIAL_TANK.capacity, INITIAL_TANK.amount),
  ]);
  const [deposit, setDeposit] = useState(INITIAL_INTEREST.deposit);
  const [rate, setRate] = useState(INITIAL_INTEREST.rate);
  const [interestFrames, setInterestFrames] = useState<InterestFrame[]>([
    createInterestFrame(0, INITIAL_INTEREST.deposit),
  ]);

  const resetTank = (nextCapacity = capacity, nextAmount = initialAmount) => {
    setTankFrames([createTankFrame(0, nextCapacity, nextAmount)]);
  };

  const advanceTank = () => {
    setTankFrames((frames) => {
      const previous = frames.at(-1)!;
      return [...frames, createTankFrame(previous.step + 1, capacity, previous.amount + inflow)];
    });
  };

  const resetInterest = (nextDeposit = deposit) => {
    setInterestFrames([createInterestFrame(0, nextDeposit)]);
  };

  const advanceInterest = () => {
    setInterestFrames((frames) => {
      const previous = frames.at(-1)!;
      return [
        ...frames,
        createInterestFrame(previous.step + 1, previous.balance * (1 + rate / 100)),
      ];
    });
  };

  return (
    <Layout title="確定的モデル | モデル化とシミュレーション">
      <section className="page-hero">
        <p className="eyebrow">DYNAMIC MODEL / DETERMINISTIC</p>
        <h1>動的モデル：確定的モデル</h1>
        <p>
          動的モデルは、時間の経過を扱うモデルです。中でも確定的モデルは、
          <strong>不確実な要素を含まない</strong>モデルです。
        </p>
      </section>

      <section className="simulation-section">
        <div className="section-heading">
          <p className="eyebrow">SIMULATION 01</p>
          <h2>水槽の水</h2>
          <p>水槽に一定のペースで水を加えていくと、水量はどのように変化するのでしょうか？</p>
        </div>
        <div className="control-panel">
          <label>
            水槽の大きさ
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => {
                const nextCapacity = readNumberInput(event.target.value, { fallback: 20, min: 1 });
                setCapacity(nextCapacity);
                resetTank(nextCapacity, initialAmount);
              }}
            />
            <em>L</em>
          </label>
          <label>
            最初の水量
            <input
              type="number"
              min="0"
              value={initialAmount}
              onChange={(event) => {
                const nextAmount = readNumberInput(event.target.value, { fallback: 0, min: 0 });
                setInitialAmount(nextAmount);
                resetTank(capacity, nextAmount);
              }}
            />
            <em>L</em>
          </label>
          <label>
            1 秒ごとに加える水量
            <input
              type="number"
              min="0"
              step="0.1"
              value={inflow}
              onChange={(event) =>
                setInflow(readNumberInput(event.target.value, { fallback: 4, min: 0 }))
              }
            />
            <em>L/秒</em>
          </label>
          <button className="primary-button" onClick={advanceTank} type="button">
            1 秒進める <span>→</span>
          </button>
          <button className="reset-button" onClick={() => resetTank()} type="button">
            最初に戻す
          </button>
        </div>
        <SimulationStrip frames={tankFrames} />
      </section>

      <section className="simulation-section">
        <div className="section-heading">
          <p className="eyebrow">SIMULATION 02</p>
          <h2>預金と利息</h2>
          <p>
            毎年利息が増えていくと、預金額はどのように変化するのでしょうか？
            なお、利息の仕組みには元本にだけ利息が発生する単利と、元本と利息の合計に利息が発生する複利という方式があるのですが、このモデルでは複利を扱っています。
          </p>
        </div>
        <div className="control-panel">
          <label>
            最初の預金額
            <input
              type="number"
              min="0"
              step="1000"
              value={deposit}
              onChange={(event) => {
                const nextDeposit = readNumberInput(event.target.value, {
                  fallback: 10000,
                  min: 0,
                });
                setDeposit(nextDeposit);
                resetInterest(nextDeposit);
              }}
            />
            <em>円</em>
          </label>
          <label>
            年利率
            <input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(event) =>
                setRate(readNumberInput(event.target.value, { fallback: 2, min: 0 }))
              }
            />
            <em>%</em>
          </label>
          <button className="primary-button" onClick={advanceInterest} type="button">
            1 年進める <span>→</span>
          </button>
          <button className="reset-button" onClick={() => resetInterest()} type="button">
            最初に戻す
          </button>
        </div>
        <SimulationStrip frames={interestFrames} />
      </section>

      <article className="reading card">
        <h2>ポイント</h2>
        <p>
          確定的モデルは不確実な要素を含まないため、同じ初期状態から同じ規則で進めれば、いつでも同じ結果になります。
        </p>
      </article>
    </Layout>
  );
}
