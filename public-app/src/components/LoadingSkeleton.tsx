export default function LoadingSkeleton() {
  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4 max-w-lg mx-auto w-full animate-pulse">
      <div className="w-32 h-32 rounded-full bg-gray-200 mb-6" />
      <div className="w-48 h-6 bg-gray-200 rounded mb-3" />
      <div className="w-64 h-4 bg-gray-200 rounded mb-2" />
      <div className="w-full h-4 bg-gray-200 rounded mb-2" />
      <div className="w-5/6 h-4 bg-gray-200 rounded mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full h-14 bg-gray-200 rounded-xl mb-3" />
      ))}
    </main>
  )
}
