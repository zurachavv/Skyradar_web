"use client";

interface SearchNavbarProps {
  title: string;
}

const SearchNavbar = ({ title }: SearchNavbarProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - placeholder */}
        <div className="w-6 h-6"></div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right side - Menu */}
        <div className="w-6 h-6">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SearchNavbar;
