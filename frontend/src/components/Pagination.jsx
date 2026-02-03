export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate page numbers dengan ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Selalu tampilkan halaman pertama
    pages.push(1);

    // Ellipsis awal
    if (showEllipsisStart) {
      pages.push("...");
    }

    // Halaman di sekitar current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Ellipsis akhir
    if (showEllipsisEnd) {
      pages.push("...");
    }

    // Selalu tampilkan halaman terakhir (jika lebih dari 1 halaman)
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-3 py-2 rounded border font-medium transition-colors ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
        }`}
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded border font-medium transition-colors min-w-[40px] ${
                currentPage === page
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-3 py-2 rounded border font-medium transition-colors ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
        }`}
      >
        Next →
      </button>
    </div>
  );
}
