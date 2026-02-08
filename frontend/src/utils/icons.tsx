import { 
  MessageSquare, Zap, Shield, Megaphone, Map, Home as HomeIcon, Layout, Info,
  Trophy, Heart, Cpu, Globe, BookOpen, Gamepad2, Code, Briefcase, AlertTriangle, Scroll
} from 'lucide-react';

const iconMap: any = {
  'MessageSquare': MessageSquare,
  'Zap': Zap,
  'Shield': Shield,
  'Megaphone': Megaphone,
  'Map': Map,
  'Home': HomeIcon,
  'Layout': Layout,
  'Info': Info,
  'Trophy': Trophy,
  'Heart': Heart,
  'Cpu': Cpu,
  'Globe': Globe,
  'BookOpen': BookOpen,
  'Gamepad2': Gamepad2,
  'Code': Code,
  'Briefcase': Briefcase,
  'AlertTriangle': AlertTriangle,
  'Scroll': Scroll
};

export const getIcon = (iconName: string | null, size: number = 22, color?: string) => {
  if (!iconName || !iconMap[iconName]) return <MessageSquare size={size} color={color} />;
  const IconComponent = iconMap[iconName];
  return <IconComponent size={size} color={color} />;
};
