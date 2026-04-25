import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: Props) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors duration-200 
      ${
        active
          ? "bg-red-600 text-white border-r-4 border-red-400"
          : "text-gray-400 hover:bg-red-900/20 hover:text-white"
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default SidebarItem;