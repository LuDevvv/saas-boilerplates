import { useState } from "react";
import { Menu, X } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
      {/* Desktop Tabs */}
      <nav
        className="hidden md:flex space-x-8 border-b border-gray-200 dark:border-gray-700"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300
              ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            <tab.Icon
              className={`w-5 h-5 mr-2 transition-colors duration-300
                ${
                  activeTab === tab.id
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                }`}
            />
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tabs.find((tab) => tab.id === activeTab)?.name}
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 dark:text-gray-400 transition-transform duration-300"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 transform transition-transform duration-300 rotate-180" />
          ) : (
            <Menu className="w-6 h-6 transform transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown with Native Animations */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center w-full py-3 px-4 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <tab.Icon className="w-5 h-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsNavigation;
