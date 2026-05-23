import axiosClient from "./axiosClient";

export const advisoryApi = {
  // Danh sách bể nuôi để người dùng chọn trước khi tư vấn
  getTanks: () => axiosClient.get("/fish-tanks?page=1&pageSize=100"),

  // Gửi câu hỏi tư vấn cho trợ lý AI (AdvisoryController)
  chat: (tankId: string, message: string) =>
    axiosClient.post("/advisory/chat", { tankId, message }),
};
