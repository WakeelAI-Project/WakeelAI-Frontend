import React, { useState } from "react"
import { ThemeProvider, useTheme } from "./components/providers/theme-provider"
import { ToastProvider, useToast } from "./components/ui/toast"
import { Sidebar } from "./components/layout/sidebar"
import { Topbar } from "./components/layout/topbar"
import { Button } from "./components/ui/button"
import { Input, Textarea } from "./components/ui/input"
import { Checkbox } from "./components/ui/checkbox"
import { Switch } from "./components/ui/switch"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio"
import { Slider } from "./components/ui/slider"
import { SegmentedControl } from "./components/ui/segmented-control"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/select"
import { Combobox, MultiSelect } from "./components/ui/combobox"
import { Badge } from "./components/ui/badge"
import { OTPInput } from "./components/ui/otp-input"
import { Alert } from "./components/ui/alert"
import { Skeleton } from "./components/ui/skeleton"
import { Progress } from "./components/ui/progress"
import { Spinner } from "./components/ui/spinner"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./components/overlay/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "./components/overlay/popover"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./components/overlay/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./components/overlay/drawer"
import { BottomSheet } from "./components/overlay/bottom-sheet"
import { Breadcrumb } from "./components/navigation/breadcrumb"
import { Stepper } from "./components/navigation/stepper"
import { Pagination } from "./components/navigation/pagination"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/navigation/tabs"
import { Table } from "./components/data-display/table"
import { StatCard } from "./components/data-display/stat-card"
import { ChartsWrapper } from "./components/data-display/charts-wrapper"
import { Timeline } from "./components/data-display/timeline"
import { ActivityFeed } from "./components/data-display/activity-feed"
import { FileUpload } from "./components/forms/file-upload"
import { EmptyState } from "./components/layout/empty-state"
import { ContractCard } from "./components/legal/contract-card"
import { ComplianceCard } from "./components/legal/compliance-card"
import { DocumentCard } from "./components/legal/document-card"
import { EmployeeCard } from "./components/legal/employee-card"
import { LeaveCard } from "./components/legal/leave-card"
import { DocumentPreview } from "./components/legal/document-preview"
import { VerificationBadge } from "./components/legal/verification-badge"
import { CommandPalette } from "./components/layout/command-palette"
import { AiMessageBubble, UserMessageBubble, AiThinkingState, AiSuggestions, VoiceButton } from "./components/ai/ai-chat"
import { Sparkles, Calendar, Plus, FileSpreadsheet, Play, Check, Send } from "lucide-react"

function DashboardContent() {
  const { direction, toggleDirection } = useTheme()
  const { toast } = useToast()
  const isRtl = direction === "rtl"

  // App States
  const [activeTab, setActiveTab] = useState("foundational")
  const [activeNav, setActiveNav] = useState("employees")
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)

  // Form states
  const [textVal, setTextVal] = useState("")
  const [otpVal, setOtpVal] = useState("")
  const [selectVal, setSelectVal] = useState("")
  const [comboboxVal, setComboboxVal] = useState("")
  const [multiVal, setMultiVal] = useState([])
  const [segVal, setSegVal] = useState("day")
  const [sliderVal, setSliderVal] = useState([40])
  const [currentPage, setCurrentPage] = useState(1)

  // Mock Data
  const tableColumns = [
    { title: isRtl ? "الاسم" : "Name", key: "name", sortable: true },
    { title: isRtl ? "القسم" : "Department", key: "dept", sortable: true },
    { title: isRtl ? "الراتب" : "Salary", key: "salary", sortable: true, isNumeric: true },
  ]

  const tableData = [
    { id: 1, name: "أحمد محمد", dept: "الموارد البشرية", salary: "18,000 ج.م" },
    { id: 2, name: "ليلى حسن", dept: "التطوير الهندسي", salary: "25,000 ج.م" },
    { id: 3, name: "كريم يوسف", dept: "الشؤون القانونية", salary: "22,000 ج.م" },
  ]

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Topbar */}
      <Topbar
        title="Wakeel UI Design System Sandbox"
        titleAr="معمل نظام تصميم وكيل"
        isRtl={isRtl}
        onSearchClick={() => setIsCommandOpen(true)}
      />

      {/* Main Container */}
      <main className="p-6 max-w-6xl w-full mx-auto space-y-8 flex-1 pb-16">
        {/* Dynamic Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--stone-50)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)] shrink-0">
          <div className="flex flex-col text-start">
            <span className="font-semibold text-sm">{isRtl ? "إعدادات العرض المعملي" : "Lab View Configuration"}</span>
            <span className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRtl ? "اختبر نظام التصميم باتجاهات ولغات مختلفة" : "Toggle direction and test the responsive flow"}
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleDirection}>
            {isRtl ? "Switch to English Layout (LTR)" : "التحويل إلى التخطيط العربي (RTL)"}
          </Button>
        </div>

        {/* Global Component Tab Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="foundational">{isRtl ? "العناصر الأساسية" : "Foundational Primitives"}</TabsTrigger>
            <TabsTrigger value="overlays">{isRtl ? "الأطر والنوافذ" : "Overlays & Modals"}</TabsTrigger>
            <TabsTrigger value="legal">{isRtl ? "القسم القانوني" : "Legal Templates"}</TabsTrigger>
            <TabsTrigger value="ai">{isRtl ? "مساعد الذكاء الاصطناعي" : "AI Assistant"}</TabsTrigger>
          </TabsList>

          {/* 1. Foundational Tab */}
          <TabsContent value="foundational" className="space-y-8 pt-4">
            {/* Buttons Section */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold border-b pb-2 text-start dark:border-[var(--stone-800)]">Buttons</h2>
              <div className="flex flex-wrap gap-3 justify-start">
                <Button variant="primary">{isRtl ? "إجراء رئيسي" : "Primary Action"}</Button>
                <Button variant="legal">{isRtl ? "توقيع المستند" : "Sign Document"}</Button>
                <Button variant="ai">{isRtl ? "طلب المساعد" : "AI Request"}</Button>
                <Button variant="secondary">{isRtl ? "إجراء فرعي" : "Secondary Action"}</Button>
                <Button variant="danger">{isRtl ? "حذف" : "Delete"}</Button>
                <Button variant="ghost">{isRtl ? "مخفي" : "Ghost"}</Button>
                <Button variant="primary" isLoading loadingText={isRtl ? "جاري الحفظ..." : "Saving..."}>
                  Loading
                </Button>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
              <div className="space-y-4">
                <h2 className="text-base font-semibold border-b pb-2 dark:border-[var(--stone-800)]">Inputs</h2>
                <Input
                  label={isRtl ? "الاسم الكامل" : "Full Name"}
                  placeholder={isRtl ? "أدخل الاسم..." : "Enter name..."}
                  required
                />
                <Input
                  label={isRtl ? "كلمة المرور" : "Password"}
                  type="password"
                  placeholder="••••••••"
                />
                <Input
                  label={isRtl ? "الراتب المقترح" : "Proposed Salary"}
                  currencySymbol="EGP"
                  placeholder="20,000"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold border-b pb-2 dark:border-[var(--stone-800)]">Selection Elements</h2>
                <Checkbox label={isRtl ? "أوافق على الشروط والأحكام" : "I agree to terms & conditions"} />
                <div className="flex items-center gap-6">
                  <Switch label={isRtl ? "تفعيل التنبيهات" : "Enable Alerts"} variant="system" />
                  <Switch label={isRtl ? "أرشفة تلقائية" : "Auto File"} variant="compliance" />
                </div>
                <RadioGroup defaultValue="1">
                  <RadioGroupItem value="1" label={isRtl ? "الخيار الأول" : "Option One"} />
                  <RadioGroupItem value="2" label={isRtl ? "الخيار الثاني" : "Option Two"} />
                </RadioGroup>
              </div>
            </div>

            {/* List selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
              <Combobox
                label={isRtl ? "القسم" : "Department"}
                options={[
                  { label: "الموارد البشرية", value: "hr" },
                  { label: "الحسابات والمالية", value: "finance" },
                  { label: "الشؤون القانونية", value: "legal" }
                ]}
                value={comboboxVal}
                onChange={setComboboxVal}
              />
              <MultiSelect
                label={isRtl ? "فريق العمل المعني" : "Assigned Team"}
                options={[
                  { label: "أحمد", value: "ahmed" },
                  { label: "ليلى", value: "layla" },
                  { label: "كريم", value: "karim" }
                ]}
                value={multiVal}
                onChange={setMultiVal}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">OTP Pin</span>
                <OTPInput value={otpVal} onChange={setOtpVal} />
              </div>
            </div>
          </TabsContent>

          {/* 2. Overlays Tab */}
          <TabsContent value="overlays" className="space-y-8 pt-4">
            <div className="space-y-4 text-start">
              <h2 className="text-base font-semibold border-b pb-2 dark:border-[var(--stone-800)]">Modals, Drawers & Scrims</h2>
              <div className="flex flex-wrap gap-3">
                {/* Dialog Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">{isRtl ? "فتح نافذة منبثقة" : "Open Dialog Modal"}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isRtl ? "تأكيد صياغة العقد" : "Confirm Contract Creation"}</DialogTitle>
                      <DialogDescription>
                        {isRtl
                          ? "هل أنت متأكد من إنشاء وإرسال العقد للمراجعة؟ سيتم تسجيل الحدث."
                          : "Are you sure you want to generate and send the contract? This action will be audited."}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">{isRtl ? "إلغاء" : "Cancel"}</Button>
                      </DialogClose>
                      <Button variant="legal" onClick={() => toast({ message: "تم إرسال العقد بنجاح", type: "success" })}>
                        {isRtl ? "موافق وتوقيع" : "Sign & Accept"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Bottom Sheet */}
                <Button variant="secondary" onClick={() => setIsBottomSheetOpen(true)}>
                  {isRtl ? "فتح لوح سفلي" : "Open Bottom Sheet"}
                </Button>
                <BottomSheet
                  isOpen={isBottomSheetOpen}
                  onClose={() => setIsBottomSheetOpen(false)}
                  title={isRtl ? "تفاصيل البند القانوني" : "Legal Clause Details"}
                >
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {isRtl
                      ? "بحسب المادة ١٠٣ من قانون العمل المصري رقم ١٤ لسنة ٢٠٢٥، يحق للموظف إجازة سنوية بأجر كامل لا تقل عن ٢١ يوماً لمن أمضى سنة كاملة في العمل."
                      : "According to Article 103 of Egyptian Labor Law, employees are entitled to a fully paid annual leave of no less than 21 days after one year of continuous service."}
                  </p>
                </BottomSheet>
              </div>
            </div>

            {/* Popover & Tooltip */}
            <div className="flex flex-wrap gap-4 items-center justify-start">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm underline cursor-help text-[var(--text-secondary)]">
                      {isRtl ? "مرر هنا لرؤية التلميح" : "Hover here for Tooltip"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRtl ? "هذه التلميحات تستخدم للإيضاح" : "Tooltips explain inline terms"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm">{isRtl ? "خيارات التصفية" : "Filter Settings"}</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-3">
                    <span className="font-semibold text-xs text-[var(--stone-500)] uppercase">Filters</span>
                    <Switch label="Active Only" />
                    <Switch label="AI Generated Only" />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </TabsContent>

          {/* 3. Legal Tab */}
          <TabsContent value="legal" className="space-y-8 pt-4">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
              <ContractCard
                title={isRtl ? "عقد عمل محدد المدة" : "Fixed-Term Work Contract"}
                employeeName="يوسف عبدالله"
                status="Signed"
                date="2026/07/15"
                salary="12,000 EGP"
              />
              <ComplianceCard
                articleNumber="مادة ١٠٣ - قانون العمل"
                title={isRtl ? "الالتزام بالحد الأدنى للأجور" : "Minimum Wage Compliance"}
                status="compliant"
                statusText={isRtl ? "ملتزم" : "Compliant"}
                description="معدل رواتب موظفي الشركة يفوق الحد الأدنى للأجور المحدد بـ 6000 ج.م."
              />
              <DocumentCard
                filename="لائحة تنظيم العمل الداخلية.pdf"
                fileSize="2.4 MB"
                isAiGenerated
                date="2026/07/26"
              />
            </div>

            {/* Document Preview Panel */}
            <div className="grid grid-cols-1 gap-6 text-start">
              <DocumentPreview
                title={isRtl ? "وثيقة عقد عمل مؤقت" : "Temporary Employment Agreement"}
                isAiGenerated
                content={`بموجب هذه الوثيقة المبرمة في تاريخ ٢٦ يوليو ٢٠٢٦، يتعهد الطرف الأول (صاحب العمل) والطرف الثاني (الموظف) بالالتزام ببنود العمل المؤقت المنصوص عليها.

المادة الأولى: طبيعة العمل
يكلف الموظف بمهام مستشار موارد بشرية مؤقت لمدة ثلاثة أشهر قابلة للتجديد بموافقة الطرفين.

المادة الثانية: الراتب والبدلات
يستحق الطرف الثاني راتباً شهرياً صافياً قدره عشرون ألف جنيه مصري، تدفع بانتظام في نهاية كل شهر ميلادي.`}
              />
            </div>
          </TabsContent>

          {/* 4. AI Tab */}
          <TabsContent value="ai" className="space-y-8 pt-4 text-start">
            <div className="max-w-2xl mx-auto border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--stone-0)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)] flex flex-col h-[500px]">
              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
                <AiMessageBubble
                  message={isRtl ? "أهلاً بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك في شؤون الامتثال والعمل اليوم؟" : "Hello. I am your AI compliance officer. How can I assist you with labor regulations today?"}
                  isRtl={isRtl}
                />
                <UserMessageBubble
                  message={isRtl ? "ما هو الحد الأقصى لساعات العمل الإضافية؟" : "What is the limit for overtime hours?"}
                  isRtl={isRtl}
                />
                <AiMessageBubble
                  message={isRtl ? "طبقاً للمادة ٨٤ من قانون العمل، لا يجوز أن تزيد ساعات العمل الفعلية والإضافية عن ١٠ ساعات يومياً." : "According to Article 84, total actual plus overtime hours must not exceed 10 hours per day."}
                  citation={isRtl ? "المادة ٨٤ · قانون العمل ١٢/٢٠٠٣" : "Article 84 · Labor Law 12/2003"}
                  isLowConfidence={false}
                  isRtl={isRtl}
                />
                <AiThinkingState label={isRtl ? "جاري صياغة البند الإضافي..." : "Drafting overtime clause..."} isRtl={isRtl} />
              </div>

              {/* Chat footer input bar */}
              <div className="p-4 border-t border-[var(--border-default)] dark:border-[var(--stone-800)] flex flex-col gap-3 shrink-0">
                <AiSuggestions
                  suggestions={
                    isRtl
                      ? ["كم رصيد إجازاتي السنوية؟", "صياغة عقد عمل مؤقت", "مراجعة بند عدم المنافسة"]
                      : ["What is my leave balance?", "Draft temporary contract", "Review non-compete clause"]
                  }
                  onSelect={(s) => toast({ message: `تم اختيار: ${s}`, type: "info" })}
                />
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1 rounded-[var(--radius-2xl)]"
                    placeholder={isRtl ? "اسأل وكيل عن أي بند أو قانون..." : "Ask Wakeel about any regulations..."}
                  />
                  <VoiceButton
                    isActive={isVoiceRecording}
                    onStart={() => setIsVoiceRecording(true)}
                    onEnd={() => setIsVoiceRecording(false)}
                    isRtl={isRtl}
                  />
                  <Button variant="ai" className="h-10 w-10 p-0 rounded-full shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Command Palette Search Overlay */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavSelect={(navId, q) => {
          if (navId === "assistant") {
            setActiveTab("ai")
            toast({ message: `AI Search query submitted: ${q}`, type: "ai" })
          } else {
            toast({ message: `Navigated to: ${navId}`, type: "success" })
          }
        }}
        isRtl={isRtl}
      />
    </div>
  )
}

export default function App() {
  const [activeNav, setActiveNav] = useState("employees")

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
          {/* Dashboard Sidebar Layout */}
          <Sidebar
            activeId={activeNav}
            onNavSelect={setActiveNav}
          />
          <DashboardContent />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
