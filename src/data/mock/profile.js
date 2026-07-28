// TODO: Replace this module with authenticated profile endpoints when the backend
// exposes them. Company scoping must be derived from the access token server-side;
// profile requests and updates must never include a client-supplied company_id.

const COMPANY_PROFILE = {
  id: "dev-company-001",
  name: "Egyptian Contracting Co.",
  legalName: "Egyptian Contracting Company LLC",
  taxId: "123456789",
  industry: "Construction",
  size: "101–250 employees",
  headquarters: "Cairo, Egypt",
  email: "admin@wakeel.ai",
  phone: "+20 100 123 4567",
  website: "https://wakeel.ai",
  createdAt: "2026-07-01",
  ownerName: "Mariam Hassan",
  policyStatus: "indexed",
  policyUpdatedAt: "2026-07-18",
  accountStatus: "active",
}

const USER_PROFILES = {
  owner: {
    fullName: "Mariam Hassan",
    initials: "MH",
    role: "Owner",
    email: "owner@wakeel.ai",
    phone: "+20 100 123 4567",
    jobTitle: "founder",
    department: "executive",
    joinDate: "2026-07-01",
    companyName: COMPANY_PROFILE.name,
    accountStatus: "active",
    lastLogin: "today",
    permissions: ["manageCompany", "manageHr", "workspaceOversight"],
  },
  hr: {
    fullName: "Nour Ali",
    initials: "NA",
    role: "HR",
    email: "hr@wakeel.ai",
    phone: "+20 111 234 5678",
    jobTitle: "hrManager",
    department: "peopleOperations",
    joinDate: "2026-07-08",
    companyName: COMPANY_PROFILE.name,
    accountStatus: "active",
    lastLogin: "today",
    permissions: ["viewCompany", "manageEmployees", "manageDocuments", "reviewCompliance"],
  },
}

const EDITABLE_COMPANY_FIELDS = [
  "name",
  "legalName",
  "taxId",
  "industry",
  "size",
  "headquarters",
  "email",
  "phone",
  "website",
]

export function getMockCompanyProfile(overrides = {}) {
  return {
    ...COMPANY_PROFILE,
    ...overrides,
  }
}

export function getMockUserProfile(role) {
  const normalizedRole = role?.toLowerCase() || ""
  const profileKey = normalizedRole.includes("owner") ? "owner" : "hr"

  return {
    ...USER_PROFILES[profileKey],
    permissions: [...USER_PROFILES[profileKey].permissions],
  }
}

export async function saveMockCompanyProfile(updates) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 250))

  return EDITABLE_COMPANY_FIELDS.reduce((safeUpdates, field) => {
    safeUpdates[field] = updates[field]?.trim?.() ?? updates[field] ?? ""
    return safeUpdates
  }, {})
}
