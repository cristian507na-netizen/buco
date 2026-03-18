import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 lg:px-8 w-full">
      {/* Mobile left side */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Buco</span>
      </div>

      {/* Desktop left side - title context if needed */}
      <div className="hidden lg:flex items-center">
        {/* Can put breadcrumbs or section title here */}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-surface transition-colors">
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-alert"></span>
          <Bell className="h-5 w-5" />
        </button>

        {/* Mobile Avatar, Desktop handled in sidebar */}
        <div className="lg:hidden h-8 w-8 overflow-hidden rounded-full bg-surface border border-border">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Carlos"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
