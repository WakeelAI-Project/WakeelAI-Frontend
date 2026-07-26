export const employees = [
  {
    id: 1,
    name: "أحمد محمد",
    nameEn: "Ahmed Mohamed",
    role: "HR Specialist",
    department: "الموارد البشرية",
    departmentEn: "People Operations",
    status: "Active",
    statusText: "نشط",
    email: "ahmed@wakeel.ai",
    phone: "+20 100 123 4567",
    hireDate: "2024/03/12",
    salary: "18,000 EGP"
  },
  {
    id: 2,
    name: "ليلى حسن",
    nameEn: "Layla Hassan",
    role: "Frontend Engineer",
    department: "التطوير الهندسي",
    departmentEn: "Engineering",
    status: "Leave",
    statusText: "إجازة",
    email: "layla@wakeel.ai",
    phone: "+20 100 987 6543",
    hireDate: "2023/09/01",
    salary: "25,000 EGP"
  },
  {
    id: 3,
    name: "كريم يوسف",
    nameEn: "Karim Youssef",
    role: "Legal Counsel",
    department: "الشؤون القانونية",
    departmentEn: "Legal",
    status: "Active",
    statusText: "نشط",
    email: "karim@wakeel.ai",
    phone: "+20 101 445 8899",
    hireDate: "2022/11/20",
    salary: "22,000 EGP"
  }
]

export const contracts = [
  {
    id: "c-1",
    title: "عقد عمل محدد المدة",
    titleEn: "Fixed-Term Work Contract",
    employeeName: "يوسف عبدالله",
    employeeNameEn: "Youssef Abdallah",
    status: "Signed",
    date: "2026/07/15",
    salary: "12,000 EGP"
  },
  {
    id: "c-2",
    title: "ملحق ساعات إضافية",
    titleEn: "Overtime Addendum",
    employeeName: "ليلى حسن",
    employeeNameEn: "Layla Hassan",
    status: "Draft",
    date: "2026/07/24",
    salary: "25,000 EGP"
  },
  {
    id: "c-3",
    title: "اتفاقية سرية بيانات",
    titleEn: "Data Confidentiality Agreement",
    employeeName: "أحمد محمد",
    employeeNameEn: "Ahmed Mohamed",
    status: "Filed",
    date: "2026/06/02",
    salary: "18,000 EGP"
  }
]

export const leaveRequests = [
  {
    id: "l-1",
    employeeName: "ليلى حسن",
    employeeNameEn: "Layla Hassan",
    leaveType: "إجازة سنوية",
    leaveTypeEn: "Annual Leave",
    startDate: "2026/08/03",
    endDate: "2026/08/08",
    daysCount: 6,
    status: "Approved",
    statusText: "مقبولة"
  },
  {
    id: "l-2",
    employeeName: "أحمد محمد",
    employeeNameEn: "Ahmed Mohamed",
    leaveType: "إجازة مرضية",
    leaveTypeEn: "Sick Leave",
    startDate: "2026/07/28",
    endDate: "2026/07/30",
    daysCount: 3,
    status: "Pending",
    statusText: "قيد المراجعة"
  }
]

export const complianceItems = [
  {
    id: "cp-1",
    articleNumber: "Article 84 - Labor Law 12/2003",
    articleNumberAr: "المادة 84 - قانون العمل 12/2003",
    title: "Overtime limit",
    titleAr: "حد ساعات العمل الإضافية",
    status: "compliant",
    statusText: "Compliant",
    statusTextAr: "ملتزم",
    description: "Actual and overtime hours are capped at 10 hours per day.",
    descriptionAr: "ساعات العمل الفعلية والإضافية لا تتجاوز 10 ساعات يوميا."
  },
  {
    id: "cp-2",
    articleNumber: "Article 103 - Labor Law 12/2003",
    articleNumberAr: "المادة 103 - قانون العمل 12/2003",
    title: "Annual leave entitlement",
    titleAr: "رصيد الإجازات السنوية",
    status: "warning",
    statusText: "Needs review",
    statusTextAr: "يتطلب مراجعة",
    description: "Two employees are close to leave carryover limits.",
    descriptionAr: "يوجد موظفان قريبان من حدود ترحيل الإجازات."
  }
]

export const documents = [
  {
    id: "d-1",
    filename: "لائحة تنظيم العمل الداخلية.pdf",
    filenameEn: "Internal Work Rules.pdf",
    fileSize: "2.4 MB",
    date: "2026/07/26",
    isAiGenerated: true
  },
  {
    id: "d-2",
    filename: "نموذج عقد عمل موحد.docx",
    filenameEn: "Unified Employment Contract.docx",
    fileSize: "680 KB",
    date: "2026/07/18",
    isAiGenerated: false
  }
]

export const auditEvents = [
  {
    id: "a-1",
    title: "AI cited Article 84 in overtime answer",
    titleAr: "استشهد المساعد بالمادة 84 في إجابة العمل الإضافي",
    time: "2026-07-26 21:42",
    actor: "Wakeel AI",
    domain: "AI"
  },
  {
    id: "a-2",
    title: "Contract sent for signature",
    titleAr: "تم إرسال عقد للتوقيع",
    time: "2026-07-26 18:15",
    actor: "Mona Hassan",
    domain: "legal"
  },
  {
    id: "a-3",
    title: "Employee profile updated",
    titleAr: "تم تحديث ملف موظف",
    time: "2026-07-25 12:04",
    actor: "Ahmed Mohamed",
    domain: "employee"
  }
]

export const assistantThread = [
  {
    id: "m-1",
    role: "ai",
    message: "أهلا بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك في شؤون الامتثال والعمل اليوم؟",
    messageEn: "Hello. I am your AI compliance officer. How can I assist you with labor regulations today?"
  },
  {
    id: "m-2",
    role: "user",
    message: "ما هو الحد الأقصى لساعات العمل الإضافية؟",
    messageEn: "What is the limit for overtime hours?"
  },
  {
    id: "m-3",
    role: "ai",
    message: "طبقا للمادة 84 من قانون العمل، لا يجوز أن تزيد ساعات العمل الفعلية والإضافية عن 10 ساعات يوميا.",
    messageEn: "According to Article 84, total actual plus overtime hours must not exceed 10 hours per day.",
    citation: "Article 84 · Labor Law 12/2003",
    citationAr: "المادة 84 · قانون العمل 12/2003",
    confidence: "96%"
  }
]
