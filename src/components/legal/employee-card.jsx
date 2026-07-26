import React from "react"
import { Mail, Phone, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

export function EmployeeCard({
  name,
  role,
  department,
  status = "Active", // Active, Leave, Suspended
  statusText,
  email,
  phone,
  hireDate,
  avatarUrl,
  onClick,
  className
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 flex flex-col justify-between gap-4 hover:bg-[var(--bg-card-raised)] transition-all cursor-pointer text-start shadow-sm select-none",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-start gap-4">
        {/* Neutral avatar ring */}
        <Avatar className="h-12 w-12 border-2 border-[var(--border-emphasis)] shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-[var(--bg-card-raised)] text-[var(--text-secondary)]">
            {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
              {name}
            </span>
            <Badge
              variant={status === "Active" ? "success" : status === "Leave" ? "leave" : "error"}
              shape="pill"
            >
              {statusText || status}
            </Badge>
          </div>
          <span className="text-xs text-[var(--text-secondary)] mt-0.5">{role}</span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">{department}</span>
        </div>
      </div>

      {/* Details contact information */}
      <div className="border-t border-[var(--border-default)] pt-3 flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
        {email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 opacity-60" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 opacity-60" />
            <span className="font-mono">{phone}</span>
          </div>
        )}
        {hireDate && (
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[var(--border-default)] text-[10px] text-[var(--text-secondary)]">
            <Calendar className="h-3.5 w-3.5 opacity-60" />
            <span>تعيين: {hireDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}
