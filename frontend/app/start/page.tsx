"use client";

import { START_INTERVIEW } from "@/graphql/mutation";
import {  useMutation } from "@apollo/client/react";
import { useState } from "react";

export default function StartInterview() {
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState("");

  const [startInterview, { data, loading }] = useMutation(START_INTERVIEW);

  const handleStart = async () => {
    await startInterview({
      variables: {
        domain,
        difficulty,
        count: Number(count),
      },
    });
  };

  return (
    <div className="p-10 space-y-6">

      {/* Domain Selection */}
      <div>
        <label className="block mb-2 font-semibold">Select Domain</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="FRONTEND">Frontend</option>
          <option value="BACKEND">Backend</option>
          <option value="HR">HR</option>
        </select>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block mb-2 font-semibold">Select Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Question Count */}
      <div>
        <label className="block mb-2 font-semibold">Number of Questions</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="border p-2 rounded w-24"
          min={1}
          max={10}
        />
      </div>

      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Interview
      </button>

      {loading && <p>Loading...</p>}

      {data?.startInterview?.questions?.map((q: any) => (
        <div key={q.id} className="mt-4 border p-4 rounded">
          {q.question}
        </div>
      ))}
    </div>
  );
}