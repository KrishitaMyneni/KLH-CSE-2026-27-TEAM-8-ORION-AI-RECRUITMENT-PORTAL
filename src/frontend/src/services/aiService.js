import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export async function analyzeCandidateJob(candidateId, jobId) {
  const [candidateResponse, jobResponse] = await Promise.all([
    api.get(`/api/candidates/${candidateId}`),
    api.get(`/api/jobs/${jobId}`),
  ]);

  const candidate = candidateResponse.data;
  const job = jobResponse.data;

  const response = await aiApi.post("/api/ai/analyze", {
    candidate: {
      candidate_id: candidate.id,
      name: candidate.name,
      email: candidate.email || "",
      phone: candidate.phone || "",
      skills: candidate.skills || "",
    },
    job: {
      job_id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      required_skills: job.requiredSkills || "",
    },
  });

  return response.data;
}

export async function screenCandidates(mode, jobId, topN) {
  const response = await axios.post(
    "http://localhost:8080/api/screenings/ai",
    null,
    {
      params: {
        jobId,
        mode,
        topN,
      },
    }
  );

  return response.data;
}