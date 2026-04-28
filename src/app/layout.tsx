// Root layout — minimal pass-through
// html/body/providers are in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
