import api from "./config";

export interface ChatMessageDTO {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSessionDTO {
  id: number;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  messages: ChatMessageDTO[];
}

export interface ChatProxyRequestMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatProxyResponse {
  response: string;
}

export interface SendMessageResponse {
  user_message: ChatMessageDTO;
  assistant_message: ChatMessageDTO;
}

export const ChatAPI = {
  async chat(messages: ChatProxyRequestMessage[]): Promise<ChatProxyResponse> {
    const response = await api.post<ChatProxyResponse>("/chat/", { messages });
    return response.data;
  },

  async startSession(): Promise<ChatSessionDTO> {
    const response = await api.post<ChatSessionDTO>("/chat/session/start/");
    return response.data;
  },

  async sendMessage(
    sessionId: number,
    message: string,
  ): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>(
      `/chat/session/${sessionId}/message/`,
      { message },
    );
    return response.data;
  },

  async endSession(sessionId: number): Promise<void> {
    await api.post(`/chat/session/${sessionId}/end/`);
  },

  async getSessionHistory(sessionId: number): Promise<ChatSessionDTO> {
    const response = await api.get<ChatSessionDTO>(
      `/chat/session/${sessionId}/history/`,
    );
    return response.data;
  },

  async listSessions(): Promise<ChatSessionDTO[]> {
    const response = await api.get<ChatSessionDTO[]>("/chat/session/sessions/");
    return response.data;
  },
};

export default ChatAPI;
