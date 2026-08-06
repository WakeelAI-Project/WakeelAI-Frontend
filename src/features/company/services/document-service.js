/**
 * Document Service
 *
 * Wraps all document-related API calls.
 *
 * Backend status:
 *   GET    /documents          — Backend endpoint not yet implemented
 *   POST   /documents/upload   — Backend endpoint not yet implemented
 *   DELETE /documents/:id      — Backend endpoint not yet implemented
 */

/**
 * Fetch all documents for the authenticated company.
 *
 * @returns {Promise<Array>} Array of document objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getDocuments() {
  // TODO: Uncomment when GET /documents is available.
  // const response = await api.get("/documents");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}

/**
 * Upload a new document.
 *
 * @param {FormData} formData - Must include the file and any metadata
 * @returns {Promise<object>} Uploaded document metadata
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function uploadDocument(_formData) {
  // TODO: Uncomment when POST /documents/upload is available.
  // const response = await api.post("/documents/upload", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}

/**
 * Delete a document by ID.
 *
 * @param {string} documentId
 * @returns {Promise<void>}
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function deleteDocument(_documentId) {
  // TODO: Uncomment when DELETE /documents/:id is available.
  // await api.delete(`/documents/${documentId}`);

  // ⚠️  Backend endpoint not implemented
  return null;
}
