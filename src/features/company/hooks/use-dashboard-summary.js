import { useEffect, useReducer } from "react"
import { listEmployees } from "../services/employee-service"
import { getLeaveRequests } from "../services/leave-service"
import { getDocuments } from "../services/document-service"

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

const INITIAL_STATE = {
  employees: { total: null, active: null, loading: true, error: null },
  leaveRequests: { total: null, pending: null, loading: true, error: null },
  documents: { total: null, loading: true, error: null },
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state, action) {
  switch (action.type) {
    case "EMPLOYEES_SUCCESS":
      return {
        ...state,
        employees: {
          total: action.total,
          active: action.active,
          loading: false,
          error: null,
        },
      }
    case "EMPLOYEES_ERROR":
      return {
        ...state,
        employees: { total: null, active: null, loading: false, error: action.error },
      }
    case "LEAVE_SUCCESS":
      return {
        ...state,
        leaveRequests: {
          total: action.total,
          pending: action.pending,
          loading: false,
          error: null,
        },
      }
    case "LEAVE_ERROR":
      return {
        ...state,
        leaveRequests: { total: null, pending: null, loading: false, error: action.error },
      }
    case "DOCUMENTS_SUCCESS":
      return {
        ...state,
        documents: { total: action.total, loading: false, error: null },
      }
    case "DOCUMENTS_ERROR":
      return {
        ...state,
        documents: { total: null, loading: false, error: action.error },
      }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches the data needed to populate the HR dashboard summary cards.
 *
 * Data sources (per API v2 + backlog Story 3.7):
 *   - Employees  → GET /employees (total from envelope)
 *   - Leave      → GET /leave-requests?status=Pending (pending count)
 *   - Documents  → GET /documents (total from envelope — stub returns [] until backend is live)
 *   - AI Usage   → No endpoint exists in API v2 (§19); value stays null
 */
export function useDashboardSummary() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    // --- Employees ---
    listEmployees({ page: 1, limit: 1 })
      .then((res) => {
        if (cancelled) return
        // API returns { data, page, total } per API v2 §7.2
        const total = res?.total ?? (Array.isArray(res?.data) ? res.data.length : null)
        dispatch({ type: "EMPLOYEES_SUCCESS", total, active: total })
      })
      .catch((err) => {
        if (cancelled) return
        dispatch({ type: "EMPLOYEES_ERROR", error: err?.message ?? "error" })
      })

    // --- Leave requests (Pending) ---
    getLeaveRequests({ status: "Pending", page: 1, limit: 1 })
      .then((res) => {
        if (cancelled) return
        // API returns { data, page, total } per API v2 §9.2
        const total = res?.total ?? (Array.isArray(res?.data) ? res.data.length : null)
        dispatch({ type: "LEAVE_SUCCESS", total, pending: total })
      })
      .catch((err) => {
        if (cancelled) return
        dispatch({ type: "LEAVE_ERROR", error: err?.message ?? "error" })
      })

    // --- Documents (stub — returns [] until backend implements GET /documents) ---
    getDocuments()
      .then((res) => {
        if (cancelled) return
        // Service may return an array directly or a paginated envelope
        const total = res?.total ?? (Array.isArray(res) ? res.length : null)
        dispatch({ type: "DOCUMENTS_SUCCESS", total })
      })
      .catch((err) => {
        if (cancelled) return
        dispatch({ type: "DOCUMENTS_ERROR", error: err?.message ?? "error" })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
