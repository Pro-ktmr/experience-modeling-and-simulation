import { useEffect, useRef } from "react";
import styles from "./CanvasFrame.module.css";

export type TankFrame = {
  kind: "tank";
  step: number;
  capacity: number;
  amount: number;
};

export type InterestFrame = {
  kind: "interest";
  step: number;
  balance: number;
};

export type BoardFrame = {
  kind: "board";
  step: number;
  squares: number;
  position: number;
  roll: number;
  previousPosition: number;
};

export type QueueFrame = {
  kind: "queue";
  step: number;
  arrived: boolean;
  arrivedPersonId: number | null;
  people: number[];
  serving: number | null;
  remaining: number;
  arrivalChance: number;
  arrivalRoll: number;
  serviceTime: number;
};

export type SimulationFrame = TankFrame | InterestFrame | BoardFrame | QueueFrame;

const CANVAS_WIDTH = 220;
const CANVAS_HEIGHT = 255;
const HAT_COLORS = ["#f35b62", "#ee9a33", "#e7c943", "#60b87b", "#3c9ed7", "#8d67c5", "#e575a9"];

function drawPerson(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  hatColor: string,
  isHighlighted = false,
  scale = 1,
) {
  context.lineWidth = isHighlighted ? 4 * scale : 2 * scale;
  context.strokeStyle = isHighlighted ? hatColor : "#3e5368";
  context.fillStyle = "#ffdfbe";
  context.beginPath();
  context.arc(x, y, 10 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = hatColor;
  context.beginPath();
  context.arc(x, y - 7 * scale, 10 * scale, Math.PI, 0);
  context.lineTo(x + 10 * scale, y - 4 * scale);
  context.lineTo(x - 10 * scale, y - 4 * scale);
  context.fill();

  context.fillStyle = "#77b4e2";
  context.fillRect(x - 9 * scale, y + 11 * scale, 18 * scale, 20 * scale);
}

function drawTank(context: CanvasRenderingContext2D, frame: TankFrame) {
  const tank = { x: 38, y: 44, width: 144, height: 150 };
  const waterRatio = Math.min(frame.amount / frame.capacity, 1);

  context.fillStyle = "#eaf7fb";
  context.fillRect(tank.x, tank.y, tank.width, tank.height);
  context.fillStyle = "#5cc4e8";
  context.fillRect(
    tank.x,
    tank.y + tank.height * (1 - waterRatio),
    tank.width,
    tank.height * waterRatio,
  );

  if (frame.amount > frame.capacity) {
    context.fillStyle = "#87d7ed";
    context.fillRect(20, 194, 180, 14);
    context.beginPath();
    context.arc(26, 204, 13, Math.PI, 0);
    context.fill();
  }

  context.strokeStyle = "#2d6685";
  context.lineWidth = 4;
  context.strokeRect(tank.x, tank.y, tank.width, tank.height);
  context.fillStyle = "#17324d";
  context.font = "700 15px sans-serif";
  context.textAlign = "center";
  context.fillText(`${frame.amount.toFixed(1)} L`, 110, 224);
  context.font = "13px sans-serif";
  context.fillText(`容量 ${frame.capacity} L`, 110, 242);
}

function drawMoneyStack(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  denomination: number,
  count: number,
) {
  if (count === 0) return;

  const isBill = denomination >= 1000;
  const itemWidth = isBill ? 37 : 16;
  const itemHeight = isBill ? 17 : 16;
  // The canvas itself clips overflowing money; individual rows and denominations do not.
  const shownCount = Math.min(count, 120);

  for (let index = 0; index < shownCount; index += 1) {
    const offset = index * 3;
    if (isBill) {
      context.fillStyle = denomination === 10000 ? "#cce6ce" : "#d8e8f5";
      context.fillRect(x + offset, y - offset, itemWidth, itemHeight);
      context.strokeStyle = "#496b65";
      context.lineWidth = 1;
      context.strokeRect(x + offset, y - offset, itemWidth, itemHeight);
      context.fillStyle = "#294c49";
      context.font = "bold 7px sans-serif";
      context.textAlign = "center";
      context.fillText(
        `¥${denomination.toLocaleString("ja-JP")}`,
        x + offset + itemWidth / 2,
        y + 11 - offset,
      );
    } else {
      context.fillStyle = denomination >= 100 ? "#e9c464" : "#c8d4d9";
      context.beginPath();
      context.arc(x + 8 + offset, y + 8 - offset, itemWidth / 2, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#8a7444";
      context.stroke();
      context.fillStyle = "#4e5d63";
      context.font = "bold 7px sans-serif";
      context.textAlign = "center";
      context.fillText(String(denomination), x + 8 + offset, y + 10 - offset);
    }
  }

  if (count > shownCount) {
    context.fillStyle = "#17324d";
    context.font = "10px sans-serif";
    context.textAlign = "left";
    context.fillText(`×${count}`, x + 42, y + 12);
  }
}

function drawInterest(context: CanvasRenderingContext2D, frame: InterestFrame) {
  let remainingAmount = Math.max(0, Math.round(frame.balance));
  const rows = [[10000], [5000, 1000], [500, 100], [50, 10], [5, 1]];

  rows.forEach((denominations, rowIndex) => {
    const y = 64 + rowIndex * 30;
    let x = 27;
    denominations.forEach((denomination) => {
      const count = Math.floor(remainingAmount / denomination);
      remainingAmount %= denomination;
      if (count === 0) return;

      drawMoneyStack(context, x, y, denomination, count);
      x += denomination >= 1000 ? 56 : 40;
    });
  });

  context.fillStyle = "#17324d";
  context.font = "700 15px sans-serif";
  context.textAlign = "center";
  context.fillText(`¥${Math.round(frame.balance).toLocaleString("ja-JP")}`, 110, 228);
}

function drawDie(context: CanvasRenderingContext2D, roll: number) {
  const die = { x: 89, y: 30, size: 40 };
  context.fillStyle = "#fff";
  context.fillRect(die.x, die.y, die.size, die.size);
  context.strokeStyle = "#17324d";
  context.lineWidth = 2;
  context.strokeRect(die.x, die.y, die.size, die.size);

  const pipLocations = {
    topLeft: [die.x + 11, die.y + 11],
    topRight: [die.x + 29, die.y + 11],
    middle: [die.x + 20, die.y + 20],
    bottomLeft: [die.x + 11, die.y + 29],
    bottomRight: [die.x + 29, die.y + 29],
    middleLeft: [die.x + 11, die.y + 20],
    middleRight: [die.x + 29, die.y + 20],
  } as const;
  const pips = [
    [],
    ["middle"],
    ["topLeft", "bottomRight"],
    ["topLeft", "middle", "bottomRight"],
    ["topLeft", "topRight", "bottomLeft", "bottomRight"],
    ["topLeft", "topRight", "middle", "bottomLeft", "bottomRight"],
    ["topLeft", "topRight", "middleLeft", "middleRight", "bottomLeft", "bottomRight"],
  ] as const;

  context.fillStyle = "#e75858";
  pips[roll].forEach((location) => {
    const [x, y] = pipLocations[location];
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fill();
  });
}

function drawBoard(context: CanvasRenderingContext2D, frame: BoardFrame) {
  const columns = 5;
  const visibleSquares = frame.squares;
  const rows = Math.ceil(frame.squares / columns);
  const cellSize = Math.min(30, 150 / rows);
  const boardY = 76;
  const boardWidth = columns * cellSize;
  const boardX = (CANVAS_WIDTH - boardWidth) / 2;

  for (let index = 0; index < visibleSquares; index += 1) {
    const squareNumber = index + 1;
    const row = Math.floor(index / columns);
    const column = row % 2 === 0 ? index % columns : columns - 1 - (index % columns);
    const x = boardX + column * cellSize;
    const y = boardY + row * cellSize;
    const isNewlyPassed = squareNumber > frame.previousPosition && squareNumber <= frame.position;

    context.fillStyle = isNewlyPassed ? "#ffd66b" : "#edf3f6";
    context.fillRect(x, y, cellSize - 2, cellSize - 2);
    context.strokeStyle = "#89a0ae";
    context.lineWidth = 1;
    context.strokeRect(x, y, cellSize - 2, cellSize - 2);
    if (cellSize >= 15) {
      context.fillStyle = "#536d7e";
      context.font = "9px sans-serif";
      context.textAlign = "center";
      context.fillText(String(squareNumber), x + cellSize / 2 - 1, y + 11);
    }
  }

  const pawnIndex = frame.position - 1;
  const pawnRow = Math.floor(pawnIndex / columns);
  const pawnColumn = pawnRow % 2 === 0 ? pawnIndex % columns : columns - 1 - (pawnIndex % columns);
  drawPerson(
    context,
    boardX + pawnColumn * cellSize + cellSize / 2 - 1,
    boardY + pawnRow * cellSize + cellSize * 0.35,
    "#f35b62",
    false,
    Math.min(0.55, cellSize / 45),
  );

  if (frame.roll > 0) drawDie(context, frame.roll);
  context.fillStyle = "#17324d";
  context.font = "12px sans-serif";
  context.textAlign = "center";
  context.fillText(`${frame.position} マス目`, 110, 242);
}

function drawRoulette(context: CanvasRenderingContext2D, frame: QueueFrame, arrivalColor: string) {
  const roulette = { x: 48, y: 63, radius: 29 };
  const startAngle = -Math.PI / 2;
  const probabilityAngle = (Math.PI * 2 * frame.arrivalChance) / 100;

  context.fillStyle = "#edf2f3";
  context.beginPath();
  context.arc(roulette.x, roulette.y, roulette.radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#8dd0d7";
  context.beginPath();
  context.moveTo(roulette.x, roulette.y);
  context.arc(roulette.x, roulette.y, roulette.radius, startAngle, startAngle + probabilityAngle);
  context.closePath();
  context.fill();

  const needleAngle = startAngle + (Math.PI * 2 * frame.arrivalRoll) / 100;
  context.strokeStyle = "#17324d";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(roulette.x, roulette.y);
  context.lineTo(
    roulette.x + Math.cos(needleAngle) * (roulette.radius - 5),
    roulette.y + Math.sin(needleAngle) * (roulette.radius - 5),
  );
  context.stroke();
  context.fillStyle = "#17324d";
  context.beginPath();
  context.arc(roulette.x, roulette.y, 4, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = frame.arrived ? arrivalColor : "#607d8b";
  context.lineWidth = frame.arrived ? 5 : 2;
  context.beginPath();
  context.arc(roulette.x, roulette.y, roulette.radius, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = "#17324d";
  context.font = "11px sans-serif";
  context.textAlign = "center";
  context.fillText(frame.arrived ? "人が到着" : "到着なし", roulette.x, 105);
}

function drawQueue(context: CanvasRenderingContext2D, frame: QueueFrame) {
  const arrivalColor =
    frame.arrivedPersonId === null
      ? "#e75858"
      : HAT_COLORS[frame.arrivedPersonId % HAT_COLORS.length];
  if (frame.step > 0) drawRoulette(context, frame, arrivalColor);

  context.fillStyle = "#8aa0ae";
  context.fillRect(174, 35, 26, 90);
  context.fillStyle = "#fff";
  context.font = "11px sans-serif";
  context.textAlign = "center";
  context.fillText("券売機", 187, 82);

  frame.people.slice(0, 4).forEach((personId, index) => {
    const isNewArrival = personId === frame.arrivedPersonId;
    drawPerson(
      context,
      145 - index * 32,
      165,
      HAT_COLORS[personId % HAT_COLORS.length],
      isNewArrival,
    );
  });

  if (frame.serving !== null) {
    const servingColor = HAT_COLORS[frame.serving % HAT_COLORS.length];
    drawPerson(context, 187, 150, servingColor, frame.serving === frame.arrivedPersonId);
    const elapsed = Math.max(0, frame.serviceTime - frame.remaining);
    const gaugeX = 165;
    const gaugeY = 118;
    context.fillStyle = "#e1e8ea";
    context.fillRect(gaugeX, gaugeY, 44, 7);
    context.fillStyle = servingColor;
    context.fillRect(gaugeX, gaugeY, (44 * elapsed) / frame.serviceTime, 7);
    context.strokeStyle = "#466070";
    context.lineWidth = 1;
    context.strokeRect(gaugeX, gaugeY, 44, 7);
    context.fillStyle = "#17324d";
    context.font = "9px sans-serif";
    context.textAlign = "center";
    context.fillText(`${elapsed}/${frame.serviceTime} 秒`, 187, 115);
  }

  context.fillStyle = "#17324d";
  context.font = "13px sans-serif";
  context.textAlign = "center";
  context.fillText(`待ち ${frame.people.length} 人`, 110, 230);
}

function drawFrame(context: CanvasRenderingContext2D, frame: SimulationFrame) {
  switch (frame.kind) {
    case "tank":
      drawTank(context, frame);
      return;
    case "interest":
      drawInterest(context, frame);
      return;
    case "board":
      drawBoard(context, frame);
      return;
    case "queue":
      drawQueue(context, frame);
  }
}

function frameLabel(frame: SimulationFrame) {
  const unit = frame.kind === "interest" ? "年" : frame.kind === "board" ? "ターン" : "秒";
  return `${frame.step} ${unit}後`;
}

export default function CanvasFrame({ frame }: { frame: SimulationFrame }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#486377";
    context.font = "700 13px sans-serif";
    context.textAlign = "left";
    context.fillText(frameLabel(frame), 12, 22);
    drawFrame(context, frame);
  }, [frame]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-label={`${frameLabel(frame)}のシミュレーション結果`}
    />
  );
}
