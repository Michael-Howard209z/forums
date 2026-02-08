import { getAutoAvatar } from '../utils/avatar';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number | string;
  borderRadius?: string;
  border?: string;
}

const Avatar = ({ src, name, size = 40, borderRadius = '4px', border = '1px solid var(--glass-border)' }: AvatarProps) => {
  const isDefault = !src || src.includes('default.jpg');
  const sizePx = typeof size === 'number' ? `${size}px` : size;
  
  // Fix for LAN access: replace localhost with the server IP
  const finalSrc = src?.replace('localhost', '192.168.1.8');

  if (!isDefault) {
    return (
      <img 
        src={finalSrc!} 
        alt={name} 
        style={{ 
          width: sizePx, 
          height: sizePx, 
          borderRadius, 
          border, 
          objectFit: 'cover' 
        }} 
      />
    );
  }

  const { initials, color } = getAutoAvatar(name);

  return (
    <div style={{
      width: sizePx,
      height: sizePx,
      borderRadius,
      border,
      backgroundColor: color,
      color: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typeof size === 'number' ? `${size * 0.4}px` : '1rem',
      fontWeight: 800,
      textShadow: '0 1px 2px rgba(255,255,255,0.2)'
    }}>
      {initials}
    </div>
  );
};

export default Avatar;
