import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function analyzeCandidateJob(candidateId, jobId) {
  const response = await aiApi.post("/api/ai/analyze", {
    candidate: {
      candidate_id: candidateId,
    },
    job: {
      job_id: jobId,
    },
  });

  return response.data;
}