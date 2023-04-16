import { PriorityQueue } from "./PriorityQueue.js";

document.addEventListener("DOMContentLoaded", function (event) {
  const MATRIX_ROWS = 10;
  const MATRIX_COLUMNS = 20;
  const FRAMES_PER_SECOND = 60;
  const DIRECTIONS = [-1, 0, 1, 0, -1];
  let matrixElements = [];
  let startPosition = 0;
  let endPosition = 110;
  let markingWalls = false;
  let startTime = Date.now();

  const algorithms = {
    "Breadth First Search": async function bfs(start, time) {
      const queue = [];
      queue.push(start);
      while (
        queue.length > 0 &&
        !matrixElements[endPosition].classList.contains("visited")
      ) {
        if (startTime !== time) return;
        const position = queue.shift();
        const cell = matrixElements[position];
        if (
          cell.classList.contains("wall") ||
          cell.classList.contains("visited")
        )
          continue;
        if (position !== start) {
          matrixElements[position].classList.add("visited");
          await sleep(1.0 / FRAMES_PER_SECOND);
        }
        if (position === endPosition) return;
        for (let i = 0; i < 4; i++) {
          const neighbor =
            position + MATRIX_COLUMNS * DIRECTIONS[i] + DIRECTIONS[i + 1];
          if (invalidMove(position, DIRECTIONS[i], DIRECTIONS[i + 1])) continue;
          queue.push(neighbor);
        }
      }
    },
    "Depth First Search": async function dfs(start, time) {
      if (
        matrixElements[start].classList.contains("visited") ||
        startTime != time ||
        matrixElements[endPosition].classList.contains("visited")
      )
        return;
      if (!matrixElements[start].classList.contains("start"))
        matrixElements[start].classList.add("visited");
      await sleep(1.0 / FRAMES_PER_SECOND);
      for (let i = 0; i < 4; i++) {
        const neighbor =
          start + MATRIX_COLUMNS * DIRECTIONS[i] + DIRECTIONS[i + 1];
        if (
          invalidMove(start, DIRECTIONS[i], DIRECTIONS[i + 1]) ||
          matrixElements[neighbor].classList.contains("start") ||
          matrixElements[neighbor].classList.contains("wall")
        )
          continue;
        await dfs(neighbor, time);
      }
    },
    "A*": async function aStar(start, time) {
      const endRow = Math.floor(endPosition / MATRIX_COLUMNS);
      const endColumn = endPosition % MATRIX_COLUMNS;
      const pq = new PriorityQueue((a, b) => {
        const aRow = Math.floor(a / MATRIX_COLUMNS);
        const aColumn = a % MATRIX_COLUMNS;
        const bRow = Math.floor(b / MATRIX_COLUMNS);
        const bColumn = b % MATRIX_COLUMNS;
        return (
          Math.abs(aRow - endRow) + Math.abs(aColumn - endColumn) <
          Math.abs(bRow - endRow) + Math.abs(bColumn - endColumn)
        );
      });
      pq.push(start);
      while (
        !pq.isEmpty() &&
        !matrixElements[endPosition].classList.contains("visited")
      ) {
        if (startTime !== time) return;
        const position = pq.pop();
        const cell = matrixElements[position];
        if (
          cell.classList.contains("wall") ||
          cell.classList.contains("visited")
        )
          continue;
        if (position !== start) {
          matrixElements[position].classList.add("visited");
          await sleep(1.0 / FRAMES_PER_SECOND);
        }
        if (position === endPosition) return;
        for (let i = 0; i < 4; i++) {
          const neighbor =
            position + MATRIX_COLUMNS * DIRECTIONS[i] + DIRECTIONS[i + 1];
          if (invalidMove(position, DIRECTIONS[i], DIRECTIONS[i + 1])) continue;
          pq.push(neighbor);
        }
      }
    },
  };

  let selectedAlgorithm = algorithms["Breadth First Search"];

  async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  function invalidMove(position, xUpdate, yUpdate) {
    const row = Math.floor(position / MATRIX_COLUMNS);
    const column = position % MATRIX_COLUMNS;
    const newRow = row + xUpdate;
    const newColumn = column + yUpdate;
    return (
      newRow < 0 ||
      newColumn < 0 ||
      newRow >= MATRIX_ROWS ||
      newColumn >= MATRIX_COLUMNS
    );
  }

  function setEnd(position) {
    matrixElements[endPosition].classList.remove("end");
    matrixElements[endPosition].draggable = false;
    endPosition = position;
    matrixElements[endPosition].classList.add("end");
    matrixElements[endPosition].draggable = true;
  }

  function handleWallMarks(event) {
    if (
      markingWalls &&
      event.target.classList.contains("cell") &&
      !event.target.classList.contains("start") &&
      !event.target.classList.contains("end")
    )
      event.target.classList.toggle("wall");
  }

  function initAlgorithmSelector(selectorElement) {
    selectorElement.classList.add("selector");
    let first = true;
    for (const [label, algorithm] of Object.entries(algorithms)) {
      const option = document.createElement("div");
      option.classList.add("option");
      option.textContent = label;
      option.addEventListener("click", (event) => {
        selectedAlgorithm = algorithm;
        const activeElement = document.getElementById("active");
        activeElement.id = "";
        event.target.id = "active";
      });
      if (document.getElementById("active") === null) option.id = "active";
      selectorElement.insertAdjacentElement("beforeend", option);
    }
  }

  function init() {
    const containerElement = document.querySelector(".container");
    const matrixWrapper = document.createElement("div");
    const matrixElement = document.createElement("div");
    const selectorElement = document.createElement("div");
    matrixWrapper.classList.add("matrixWrapper");
    matrixWrapper.insertAdjacentElement("beforeend", matrixElement);
    containerElement.insertAdjacentElement("beforeend", selectorElement);
    matrixElement.classList.add("matrix");
    matrixElement.style.gridTemplateColumns = `repeat(${MATRIX_COLUMNS}, 4%)`;
    containerElement.insertAdjacentElement("beforeend", matrixWrapper);
    initAlgorithmSelector(selectorElement);
    for (let i = 0; i < MATRIX_ROWS * MATRIX_COLUMNS; i++) {
      const cell = document.createElement("div");
      // Listener to start new simulation from this cell
      cell.addEventListener("click", (event) => {
        matrixElements[startPosition].classList.remove("start");
        for (let j = 0; j < MATRIX_ROWS * MATRIX_COLUMNS; j++)
          matrixElements[j].classList.remove("visited");
        event.target.classList.add("start");
        startPosition = i;
        startTime = Date.now();
        selectedAlgorithm(startPosition, startTime);
      });
      // Listeners to move the end point to another cell
      cell.addEventListener("dragenter", (event) => {
        event.preventDefault();
      });
      cell.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      cell.addEventListener("dragstart", (event) => {
        if (Number(event.target.id) === endPosition)
          matrixElements[endPosition].classList.remove("end");
      });
      cell.addEventListener("drop", (event) => {
        if (event.target.classList.contains("cell"))
          setEnd(Number(event.target.id));
        else matrixElements[endPosition].classList.add("end");
      });
      // Listeners to handle activating wall marking
      cell.addEventListener("mousedown", (event) => {
        if (
          !event.target.classList.contains("end") &&
          !event.target.classList.contains("start")
        )
          markingWalls = true;
      });
      // Listener to handle marking walls
      cell.addEventListener("mouseleave", handleWallMarks);
      cell.classList.add("cell");
      cell.id = `${i}`;
      matrixElement.insertAdjacentElement("beforeend", cell);
      matrixElements.push(cell);
    }
    document.addEventListener("mouseup", () => {
      markingWalls = false;
    });
    setEnd(endPosition);
  }

  init();
});
