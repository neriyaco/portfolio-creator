interface Props {
  message: string
}

export default function ErrorState({ message }: Props) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-2xl font-semibold mb-2">Something went wrong</p>
      <p className="text-sm text-gray-500">{message}</p>
    </main>
  )
}
