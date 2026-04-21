// Design Ref: §3.1 — User 엔티티
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: Date | null
  createdAt: Date
}
