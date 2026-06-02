import axiosClient from "./axiosClient";

export interface AdvisoryFeedbackRequest {
  tankId: string;
  response: string;
  helpful: boolean;
  intent?: string | null;
  question?: string | null;
}

export const advisoryApi = {
  // Danh sách bể nuôi để người dùng chọn trước khi tư vấn
  getTanks: () => axiosClient.get("/fish-tanks?page=1&pageSize=100"),

  // Gửi câu hỏi tư vấn cho trợ lý AI (AdvisoryController)
  chat: (tankId: string, message: string) =>
    axiosClient.post("/advisory/chat", { tankId, message }),

  // Gửi đánh giá hữu ích / không hữu ích cho câu trả lời AI
  submitFeedback: (data: AdvisoryFeedbackRequest) =>
    axiosClient.post("/advisory/chat/feedback", data),
};
