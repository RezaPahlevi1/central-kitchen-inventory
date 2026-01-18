function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
      <p className="text-yellow-500 text-xl">Loading...</p>
    </div>
  );
}

export default Loading;
