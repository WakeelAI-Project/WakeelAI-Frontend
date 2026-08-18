import api from "../../../lib/api";

/**
 * Fetch all leave requests for the authenticated company.
 *
 * GET /leave-requests
 * Query params: status (optional), page, limit
 *
 * @param {object} [params]
 * @param {string} [params.status] - Filter by status (Pending, Approved, Rejected)
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @returns {Promise<object>} Pagination envelope containing { data: Array, page: number, total: number }
 */
export async function getLeaveRequests({ status, page = 1, limit = 20 } = {}) {
  const params = { page, limit };
  if (status && status !== "all") {
    params.status = status;
  }
  const response = await api.get("/leave-requests", { params });
  return response.data;
}

/**
 * Approve or reject a leave request.
 *
 * PATCH /leave-requests/{requestId}
 * Body: { status: "Approved" | "Rejected", hr_note: string }
 *
 * @param {string} requestId
 * @param {"Approved"|"Rejected"} status
 * @param {string} hrNote
 * @returns {Promise<object>} Updated leave request object
 */
export async function updateLeaveRequest(requestId, status, hrNote) {
  const response = await api.patch(`/leave-requests/${requestId}`, {
    status,
    hr_note: hrNote,
  });
  return response.data;
}

/**
 * Upload a medical report attachment for sick leave.
 *
 * POST /leave-requests/attachments
 * Body: multipart/form-data
 *
 * @param {File} file
 * @returns {Promise<object>} { attachment_url: string }
 */
export async function uploadLeaveAttachment(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/leave-requests/attachments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

