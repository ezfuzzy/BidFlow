import React, { useState, useEffect } from "react";
import { Plus, Minus, RefreshCw } from "lucide-react";

const MemoryBlock = ({ processes, totalMemory, onProcessClick, selectedProcess }) => {
  const renderMemoryBlocks = () => {
    let blocks = [];
    let currentPosition = 0;

    for (let i = 0; i <= processes.length; i++) {
      if (i < processes.length) {
        const process = processes[i];

        if (process.start > currentPosition) {
          const freeSpace = process.start - currentPosition;
          blocks.push(
            <div
              key={`free-${currentPosition}`}
              style={{ height: `${(freeSpace / totalMemory) * 100}%` }}
              className="w-full bg-gray-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                빈 공간 ({freeSpace}MB)
              </div>
            </div>
          );
        }

        blocks.push(
          <div
            key={`process-${i}`}
            style={{ height: `${(process.size / totalMemory) * 100}%` }}
            className={`w-full ${process.color} relative cursor-pointer ${
              selectedProcess === i ? "border-4 border-black" : ""
            }`}
            onClick={() => onProcessClick(i)}>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {process.name} ({process.size}MB)
            </div>
          </div>
        );

        currentPosition = process.start + process.size;
      } else {
        const remainingSpace = totalMemory - currentPosition;
        if (remainingSpace > 0) {
          blocks.push(
            <div
              key={`free-end`}
              style={{ height: `${(remainingSpace / totalMemory) * 100}%` }}
              className="w-full bg-gray-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                빈 공간 ({remainingSpace}MB)
              </div>
            </div>
          );
        }
      }
    }

    return blocks;
  };

  return (
    <div className="w-64 h-[calc(100vh-4rem)] bg-gray-200 rounded-lg overflow-hidden relative">
      {renderMemoryBlocks()}
    </div>
  );
};

const ControlPanel = ({ onAllocate, onDeallocate, onReset, totalMemory, setTotalMemory }) => {
  const [processName, setProcessName] = useState("");
  const [processSize, setProcessSize] = useState("");
  const [allocationType, setAllocationType] = useState("first-fit");

  const handleAllocate = () => {
    if (processName && processSize) {
      onAllocate(processName, parseInt(processSize, 10), allocationType);
      setProcessName("");
      setProcessSize("");
    }
  };

  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">제어 패널</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Memory</label>
          <input
            type="number"
            value={totalMemory}
            onChange={(e) => setTotalMemory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">할당 방식</label>
          <select
            value={allocationType}
            onChange={(e) => setAllocationType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <option value="first-fit">First Fit</option>
            <option value="best-fit">Best Fit</option>
            <option value="worst-fit">Worst Fit</option>
            <option value="next-fit">Next Fit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Process 이름</label>
          <input
            type="text"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Process 크기 (MB)</label>
          <input
            type="number"
            value={processSize}
            onChange={(e) => setProcessSize(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={handleAllocate}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <Plus className="inline-block mr-2" size={16} />
          할당
        </button>
        <button
          onClick={onDeallocate}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          <Minus className="inline-block mr-2" size={16} />
          해제
        </button>
        <button
          onClick={onReset}
          className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          <RefreshCw className="inline-block mr-2" size={16} />
          초기화
        </button>
      </div>
    </div>
  );
};

const ProcessInfo = ({ process, onNameChange }) => {
  const [editName, setEditName] = useState(process.name);

  useEffect(() => {
    setEditName(process.name);
  }, [process]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNameChange(editName);
  };

  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Process 정보</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Process 이름</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Process 크기</label>
            <p className="mt-1">{process.size} MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">할당 시간</label>
            <p className="mt-1">{new Date(process.allocatedAt).toLocaleString()}</p>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            이름 수정
          </button>
        </div>
      </form>
    </div>
  );
};

const MemorySimulator = () => {
  const [totalMemory, setTotalMemory] = useState(1024);
  const [processes, setProcesses] = useState([
    { name: "a", size: 128, start: 0, allocatedAt: new Date().toISOString(), color: "bg-red-500" },
    { name: "b", size: 64, start: 128, allocatedAt: new Date().toISOString(), color: "bg-blue-500" },
    { name: "c", size: 256, start: 192, allocatedAt: new Date().toISOString(), color: "bg-green-500" },
    { name: "d", size: 64, start: 448, allocatedAt: new Date().toISOString(), color: "bg-yellow-500" },
  ]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [error, setError] = useState(null);
  const [lastAllocatedIndex, setLastAllocatedIndex] = useState(0);

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  const findFreeSpace = (size, type) => {
    let freeSpaces = [];
    let start = 0;

    for (let i = 0; i <= processes.length; i++) {
      const end = i < processes.length ? processes[i].start : totalMemory;
      const spaceSize = end - start;

      if (spaceSize >= size) {
        freeSpaces.push({ start, size: spaceSize });
      }

      if (i < processes.length) {
        start = processes[i].start + processes[i].size;
      }
    }

    if (freeSpaces.length === 0) return null;

    if (type === "first-fit") {
      return freeSpaces[0];
    } else if (type === "best-fit") {
      return freeSpaces.reduce((best, current) => (current.size < best.size && current.size >= size ? current : best));
    } else if (type === "worst-fit") {
      return freeSpaces.reduce((worst, current) => (current.size > worst.size ? current : worst));
    } else if (type === "next-fit") {
      for (let i = lastAllocatedIndex; i < freeSpaces.length; i++) {
        if (freeSpaces[i].size >= size) {
          setLastAllocatedIndex(i);
          return freeSpaces[i];
        }
      }
      for (let i = 0; i < lastAllocatedIndex; i++) {
        if (freeSpaces[i].size >= size) {
          setLastAllocatedIndex(i);
          return freeSpaces[i];
        }
      }
    }
  };

  const allocateMemory = (name, size, type) => {
    const freeSpace = findFreeSpace(size, type);

    if (freeSpace) {
      const newProcess = {
        name,
        size,
        start: freeSpace.start,
        allocatedAt: new Date().toISOString(),
        color: colors[processes.length % colors.length],
      };

      const newProcesses = [...processes, newProcess].sort((a, b) => a.start - b.start);
      setProcesses(newProcesses);
      setError(null);
    } else {
      setError("메모리 할당 실패: 충분한 공간이 없습니다.");
    }
  };

  const deallocateMemory = () => {
    if (selectedProcess !== null) {
      const newProcesses = processes.filter((_, index) => index !== selectedProcess);
      setProcesses(newProcesses);
      setSelectedProcess(null);
      setError(null);
    } else {
      setError("잘못된 process 인덱스");
    }
  };

  const resetMemory = () => {
    setProcesses([]);
    setSelectedProcess(null);
    setError(null);
  };

  const handleProcessClick = (index) => {
    setSelectedProcess(index);
  };

  const handleNameChange = (newName) => {
    if (selectedProcess !== null) {
      const updatedProcesses = processes.map((process, index) =>
        index === selectedProcess ? { ...process, name: newName } : process
      );
      setProcesses(updatedProcesses);
      setError(null);
    } else {
      setError("잘못된 process 인덱스 또는 이름");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 p-4">
        <ControlPanel
          onAllocate={allocateMemory}
          onDeallocate={deallocateMemory}
          onReset={resetMemory}
          totalMemory={totalMemory}
          setTotalMemory={setTotalMemory}
        />
        {error && <div className="mt-4 text-red-500">{error}</div>}
      </div>
      <div className="w-1/2 p-4 flex justify-center">
        <MemoryBlock
          processes={processes}
          totalMemory={totalMemory}
          onProcessClick={handleProcessClick}
          selectedProcess={selectedProcess}
        />
      </div>
      <div className="w-1/4 p-4">
        {selectedProcess !== null && (
          <ProcessInfo process={processes[selectedProcess]} onNameChange={handleNameChange} />
        )}
      </div>
    </div>
  );
};

export default MemorySimulator;