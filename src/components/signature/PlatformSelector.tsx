import { motion } from "framer-motion";

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const PLATFORMS: Platform[] = [
  { id: 'outlook', name: 'Outlook', icon: '📧', color: '#0078d4' },
  { id: 'new-outlook', name: 'New Outlook', icon: '📬', color: '#0078d4' },
  { id: 'outlook365', name: 'Outlook 365', icon: '☁️', color: '#d83b01' },
  { id: 'apple-mail', name: 'Apple Mail', icon: '🍎', color: '#007aff' },
  { id: 'gmail', name: 'Gmail', icon: '📨', color: '#ea4335' },
  { id: 'thunderbird', name: 'Thunderbird', icon: '🦊', color: '#0a84ff' },
  { id: 'exchange', name: 'Exchange Server', icon: '🏢', color: '#0078d4' },
  { id: 'microsoft365', name: 'Microsoft 365', icon: '🔷', color: '#0078d4' },
];

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelect: (platformId: string) => void;
}

const PlatformSelector = ({ selectedPlatform, onSelect }: PlatformSelectorProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <h2 className="text-lg text-foreground font-semibold text-center mb-4">
        1. Choose email platform
      </h2>
      
      <div className="grid grid-cols-4 gap-3">
        {PLATFORMS.map((platform) => (
          <motion.button
            key={platform.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(platform.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors transform-gpu${
              selectedPlatform === platform.id
                ? 'border-secondary bg-secondary/10'
                : 'border-border hover:border-secondary/50'
            }`}
          >
            <span className="text-2xl">{platform.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {platform.name}
            </span>
          </motion.button>
        ))}
      </div>

      <p className="text-center mt-4 text-xs text-muted-foreground">
        Looking for another email platform?{' '}
        <span className="text-primary cursor-pointer hover:underline">
          Check out the supported platforms here
        </span>
      </p>
    </div>
  );
};

export default PlatformSelector;
