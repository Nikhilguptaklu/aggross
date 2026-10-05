import { useState } from "react";

export default function Tabs({ tabs, defaultTab, onChange }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleSelect = (id) => {
    setActive(id);
    if (onChange) onChange(id);
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div>
      <div className="flex gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.id
                ? "text-primary-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active === tab.id ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
            {active === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-600" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  );
}
