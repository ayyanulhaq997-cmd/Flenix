import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TVNavigationTabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabChange?: (index: number) => void;
  focusedTabIndex?: number;
}

export function TVNavigationTabs({
  tabs,
  activeTab,
  onTabChange,
  focusedTabIndex = -1,
}: TVNavigationTabsProps) {
  return (
    <div className="flex gap-8 px-12 py-6 border-b border-red-900/20 bg-black/50 backdrop-blur-sm">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(index)}
          data-focus-id={`tab-${index}`}
          className={cn(
            "px-6 py-3 text-lg font-semibold uppercase tracking-wider transition-all duration-200",
            "focus:outline-none relative",
            activeTab === index
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white border-b-2 border-transparent",
            focusedTabIndex === index && "ring-2 ring-red-500 ring-offset-4 ring-offset-black rounded-lg"
          )}
        >
          {tab.label}
          
          {/* Focus Indicator */}
          {focusedTabIndex === index && (
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
