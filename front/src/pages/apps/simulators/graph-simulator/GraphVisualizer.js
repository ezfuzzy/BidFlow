import React, { useState, useRef, useEffect } from "react";
import Graph from "./Graph";

const GraphVisualizer = () => {
  const [matrix, setMatrix] = useState([]);
  const [inputType, setInputType] = useState("json");
  const [showWeight, setShowWeight] = useState(false);
  const [showDirection, setShowDirection] = useState(false);
  const [matrixInput, setMatrixInput] = useState("");
  const [showTip, setShowTip] = useState(false);
  const textareaRef = useRef(null);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    let parsedMatrix;

    if (inputType === "json") {
      try {
        parsedMatrix = JSON.parse(matrixInput);
      } catch (e) {
        alert("유효하지 않은 JSON 형식입니다. 올바른 인접 행렬을 입력해주세요.");
        return;
      }
    } else {
      const rows = matrixInput.trim().split("\n");

      parsedMatrix = rows
        .map((row) => {
          const rowData = row
            .trim()
            .split(" ")
            .map((num) => {
              const parsed = Number(num);
              return isNaN(parsed) ? 0 : parsed;
            });

          return rowData;
        })
        .filter((row) => row.length > 0);

      const maxLength = Math.max(...parsedMatrix.map((row) => row.length));

      parsedMatrix = parsedMatrix.map((row) => {
        while (row.length < maxLength) {
          row.push(0);
        }
        return row;
      });
    }

    setMatrix(parsedMatrix);
    setShowTip(true);
    
    // 서버 API 호출 대신 콘솔에 로그 출력
    console.log("그래프 매트릭스:", parsedMatrix);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [matrixInput]);

  useEffect(() => {
    if (inputType === "json") {
      setMatrixInput("[\n   [0, 1, 0],\n   [1, 0, 1],\n   [0, 1, 0]\n]");
    } else {
      setMatrixInput("0 1 0\n1 0 1\n0 1 0");
    }
  }, [inputType]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6">그래프 시각화 도구</h1>
      <form id="matrix-form" onSubmit={handleFormSubmit} className="mb-6 max-w-md w-full mx-auto">
        <p id="input-tip" className="mb-4 text-gray-700 text-center">
          가중치가 있는 인접 행렬을 { inputType === "json" ? "JSON" : "문자열" } 형식으로 입력하세요.
        </p>
        <div className="flex items-center justify-center mb-4">
          <label className="mr-6 flex items-center">
            <input
              type="radio"
              name="input-type"
              checked={inputType === "json"}
              onChange={() => setInputType("json")}
            />
            <span className="ml-2">JSON</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="input-type"
              checked={inputType === "string"}
              onChange={() => setInputType("string")}
            />
            <span className="ml-2">문자열</span>
          </label>
        </div>
        <textarea
          id="matrix-input"
          className="w-full p-4 border rounded mb-2 "
          value={matrixInput}
          onChange={(e) => setMatrixInput(e.target.value)}
          ref={textareaRef}
          rows={5}
          style={{ resize: "none", overflow: "hidden", minHeight: "5em" }}
        ></textarea>
        <div className="flex items-center justify-center mb-4">
          <label className="flex items-center mr-6">
            <input type="checkbox" checked={showWeight} onChange={() => setShowWeight(!showWeight)} />
            <span className="ml-2">가중치</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={showDirection} onChange={() => setShowDirection(!showDirection)} />
            <span className="ml-2">방향</span>
          </label>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          시각화
        </button>
      </form>
      {showTip && (
        <div className="mb-4 text-gray-700 text-center font-bold">
          노드를 드래그하여 이동할 수 있습니다.
        </div>
      )}
      <div className="flex items-center justify-center mb-4">
        <Graph matrix={matrix} showWeight={showWeight} showDirection={showDirection} />
      </div>
    </div>
  );
};

export default GraphVisualizer;