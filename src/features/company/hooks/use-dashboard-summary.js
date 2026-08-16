import { useEffect, useReducer } from "react";
import { getDashboardSummary } from "../services/dashboard-service";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

const INITIAL_STATE = {
  employees: {
    count: null,
    active: null,
    onLeaveToday: null,
    loading: true,
    error: null,
  },
  leaveRequests: { pending: null, loading: true, error: null },
  documents: { count: null, loading: true, error: null },
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state, action) {
  switch (action.type) {
    case "SUMMARY_SUCCESS":
      return {
        employees: {
          count: action.data.employee_count,
          active: action.data.active_employees,
          onLeaveToday: action.data.employees_on_leave_today,
          loading: false,
          error: null,
        },
        leaveRequests: {
          pending: action.data.pending_leave_requests,
          loading: false,
          error: null,
        },
        documents: {
          count: action.data.generated_documents_count,
          loading: false,
          error: null,
        },
      };
    case "SUMMARY_ERROR":
      return {
        employees: {
          count: null,
          active: null,
          onLeaveToday: null,
          loading: false,
          error: action.error,
        },
        leaveRequests: { pending: null, loading: false, error: action.error },
        documents: { count: null, loading: false, error: action.error },
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches the data needed to populate the HR dashboard summary cards.
 *
 * Data source: GET /api/dashboard/summary
 */
export function useDashboardSummary() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary()
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: "SUMMARY_SUCCESS", data });
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch({ type: "SUMMARY_ERROR", error: err?.message ?? "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
