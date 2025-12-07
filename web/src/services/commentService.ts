import axiosClient from "@/lib/axiosClient";

export interface AdminComment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  parentId?: number | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFilters {
  postId?: number;
  userId?: number;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export async function fetchAllComments(params?: CommentFilters) {
  // Ưu tiên endpoint admin khi có params filter (trang quản trị)
  if (params && Object.keys(params).length > 0) {
    const res = await axiosClient.get("/comments/admin", { params });
    return res.data as AdminComment[];
  }
  const res = await axiosClient.get("/comments");
  return res.data as AdminComment[];
}

export async function deleteCommentAdmin(id: number) {
  try {
    const res = await axiosClient.delete(`/comments/remove/${id}`);
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const GetAllComments = async () => {
  try {
    const response = await axiosClient.get('/comments/all');
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

const CreateComment = async (payload) => {
  try {
    const response = await axiosClient.post('/comments', payload);
    console.log('response: ', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export {
  GetAllComments,
  CreateComment
};