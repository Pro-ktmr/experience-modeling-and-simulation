import { BoardFrame, QueueFrame } from "@/components/CanvasFrame";
import Layout from "@/components/Layout";
import SimulationStrip from "@/components/SimulationStrip";
import { readIntegerInput, readNumberInput } from "@/components/simulationUtils";
import { useState } from "react";

const INITIAL_BOARD_SQUARES = 20;
const INITIAL_ARRIVAL_CHANCE = 40;
const INITIAL_SERVICE_TIME = 3;

function createBoardFrame(
  step: number,
  squares: number,
  position: number,
  roll: number,
  previousPosition: number,
): BoardFrame {
  return { kind: "board", step, squares, position, roll, previousPosition };
}

function createQueueFrame(
  step: number,
  arrived: boolean,
  arrivedPersonId: number | null,
  people: number[],
  serving: number | null,
  remaining: number,
  arrivalChance: number,
  arrivalRoll: number,
  serviceTime: number,
): QueueFrame {
  return {
    kind: "queue",
    step,
    arrived,
    arrivedPersonId,
    people,
    serving,
    remaining,
    arrivalChance,
    arrivalRoll,
    serviceTime,
  };
}

export default function Probabilistic() {
  const [squares, setSquares] = useState(INITIAL_BOARD_SQUARES);
  const [boardFrames, setBoardFrames] = useState<BoardFrame[]>([
    createBoardFrame(0, INITIAL_BOARD_SQUARES, 1, 0, 1),
  ]);
  const [arrivalChance, setArrivalChance] = useState(INITIAL_ARRIVAL_CHANCE);
  const [serviceTime, setServiceTime] = useState(INITIAL_SERVICE_TIME);
  const [queueFrames, setQueueFrames] = useState<QueueFrame[]>([
    createQueueFrame(0, false, null, [], null, 0, INITIAL_ARRIVAL_CHANCE, 0, INITIAL_SERVICE_TIME),
  ]);

  const resetBoard = (nextSquares = squares) => {
    setBoardFrames([createBoardFrame(0, nextSquares, 1, 0, 1)]);
  };

  const advanceBoard = () => {
    setBoardFrames((frames) => {
      const previous = frames.at(-1)!;
      const roll = Math.floor(Math.random() * 6) + 1;
      return [
        ...frames,
        createBoardFrame(
          previous.step + 1,
          squares,
          previous.position + roll,
          roll,
          previous.position,
        ),
      ];
    });
  };

  const resetQueue = () => {
    setQueueFrames([createQueueFrame(0, false, null, [], null, 0, arrivalChance, 0, serviceTime)]);
  };

  const advanceQueue = () => {
    setQueueFrames((frames) => {
      const previous = frames.at(-1)!;
      const arrivalRoll = Math.random() * 100;
      const personArrives = arrivalRoll < arrivalChance;
      const arrivedPersonId = personArrives ? previous.step + 1 : null;
      let people = [...previous.people];
      let serving = previous.serving;
      let remaining = previous.remaining;

      // A person currently using the machine finishes at the end of this second.
      if (serving !== null) {
        remaining -= 1;
        if (remaining <= 0) {
          serving = null;
          remaining = 0;
        }
      }

      if (arrivedPersonId !== null) people.push(arrivedPersonId);

      // The first person in line starts immediately when the machine is free.
      if (serving === null && people.length > 0) {
        serving = people[0];
        people = people.slice(1);
        remaining = serviceTime;
      }

      return [
        ...frames,
        createQueueFrame(
          previous.step + 1,
          personArrives,
          arrivedPersonId,
          people,
          serving,
          remaining,
          arrivalChance,
          arrivalRoll,
          serviceTime,
        ),
      ];
    });
  };

  return (
    <Layout title="確率的モデル | モデル化とシミュレーション">
      <section className="page-hero">
        <p className="eyebrow">DYNAMIC MODEL / PROBABILISTIC</p>
        <h1>動的モデル：確率的モデル</h1>
        <p>
          動的モデルは、時間の経過を扱うモデルです。中でも確率的モデルは、
          <strong>不確実な要素を含む</strong>モデルです。
        </p>
      </section>

      <section className="simulation-section">
        <div className="section-heading">
          <p className="eyebrow">SIMULATION 03</p>
          <h2>すごろく</h2>
          <p>さいころを振ると駒はどのように進んでいくでしょうか？</p>
        </div>
        <div className="control-panel">
          <label>
            マス数
            <input
              type="number"
              min="1"
              max="25"
              value={squares}
              onChange={(event) => {
                const nextSquares = readIntegerInput(event.target.value, {
                  fallback: INITIAL_BOARD_SQUARES,
                  min: 1,
                  max: 25,
                });
                setSquares(nextSquares);
                resetBoard(nextSquares);
              }}
            />
            <em>マス</em>
          </label>
          <button className="primary-button" onClick={advanceBoard} type="button">
            さいころを振る <span>🎲</span>
          </button>
          <button className="reset-button" onClick={() => resetBoard()} type="button">
            最初に戻す
          </button>
        </div>
        <SimulationStrip frames={boardFrames} />
      </section>

      <section className="simulation-section">
        <div className="section-heading">
          <p className="eyebrow">SIMULATION 04</p>
          <h2>券売機の待ち行列</h2>
          <p>券売機に並んでいる人数はどのように変化するのでしょうか？</p>
        </div>
        <div className="control-panel">
          <label>
            各秒に新しい人が現れる確率
            <input
              type="number"
              min="0"
              max="100"
              value={arrivalChance}
              onChange={(event) =>
                setArrivalChance(
                  readIntegerInput(event.target.value, {
                    fallback: INITIAL_ARRIVAL_CHANCE,
                    min: 0,
                    max: 100,
                  }),
                )
              }
            />
            <em>%</em>
          </label>
          <label>
            1 人が券売機を使う時間
            <input
              type="number"
              min="1"
              value={serviceTime}
              onChange={(event) =>
                setServiceTime(
                  readNumberInput(event.target.value, {
                    fallback: INITIAL_SERVICE_TIME,
                    min: 1,
                  }),
                )
              }
            />
            <em>秒</em>
          </label>
          <button className="primary-button" onClick={advanceQueue} type="button">
            1 秒進める <span>→</span>
          </button>
          <button className="reset-button" onClick={resetQueue} type="button">
            最初に戻す
          </button>
        </div>
        <SimulationStrip frames={queueFrames} />
      </section>

      <article className="reading card">
        <h2>ポイント</h2>
        <p>
          確率的モデルは不確実な要素を含むため、同じ初期状態から同じ規則で進めても、毎回同じ結果になるとは限りません。
        </p>
      </article>
    </Layout>
  );
}
