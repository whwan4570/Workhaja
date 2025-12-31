import type { Store, Member, Shift } from "./types"

export const mockStores: Store[] = [
  { id: "1", name: "Downtown Location", timezone: "America/New_York", myRole: "OWNER" },
  { id: "2", name: "Westside Branch", timezone: "America/Los_Angeles", myRole: "MANAGER" },
  { id: "3", name: "North Plaza", timezone: "America/Chicago", myRole: "WORKER" },
  { id: "4", name: "Harbor Point", timezone: "America/New_York", myRole: "MANAGER" },
]

export const mockMembers: Member[] = [
  { id: "1", name: "Alice Johnson", email: "alice@shiftory.com", role: "OWNER", status: "ACTIVE" },
  { id: "2", name: "Bob Smith", email: "bob@shiftory.com", role: "MANAGER", status: "ACTIVE" },
  { id: "3", name: "Carol Davis", email: "carol@shiftory.com", role: "WORKER", status: "ACTIVE" },
  { id: "4", name: "David Wilson", email: "david@shiftory.com", role: "WORKER", status: "ACTIVE" },
  { id: "5", name: "Eve Martinez", email: "eve@shiftory.com", role: "WORKER", status: "INACTIVE" },
  { id: "6", name: "Frank Brown", email: "frank@shiftory.com", role: "WORKER", status: "ACTIVE" },
  { id: "7", name: "Grace Lee", email: "grace@shiftory.com", role: "MANAGER", status: "ACTIVE" },
]

export const mockShifts: Shift[] = [
  {
    id: "1",
    employeeId: "3",
    employeeName: "Carol Davis",
    date: "2026-01-15",
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 30,
    status: "PUBLISHED",
  },
  {
    id: "2",
    employeeId: "4",
    employeeName: "David Wilson",
    date: "2026-01-15",
    startTime: "10:00",
    endTime: "18:00",
    breakMinutes: 45,
    status: "PUBLISHED",
  },
  {
    id: "3",
    employeeId: "6",
    employeeName: "Frank Brown",
    date: "2026-01-15",
    startTime: "14:00",
    endTime: "22:00",
    breakMinutes: 30,
    status: "DRAFT",
  },
  {
    id: "4",
    employeeId: "3",
    employeeName: "Carol Davis",
    date: "2026-01-16",
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 30,
    status: "PUBLISHED",
  },
  {
    id: "5",
    employeeId: "4",
    employeeName: "David Wilson",
    date: "2026-01-17",
    startTime: "10:00",
    endTime: "18:00",
    breakMinutes: 45,
    status: "DRAFT",
  },
]
