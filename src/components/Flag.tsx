import { getFlagUrl } from '../lib/dataHelpers';

interface Props {
  code: string;
  name?: string;
  size?: number;        // flagcdn width bucket (20, 40, 80)
  className?: string;
}

/**
 * Renders a country flag, or a neutral placeholder when the team has no
 * matched flag code (avoids empty-src network warnings).
 */
export default function Flag({ code, name = '', size = 40, className = '' }: Props) {
  if (!code) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-gray-700 text-gray-400 text-[8px] font-bold rounded-sm ${className}`}
        title={name}
      >
        {name.slice(0, 3).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={getFlagUrl(code, size)}
      alt={name}
      title={name}
      className={`object-cover rounded-sm ${className}`}
      onError={e => {
        const el = e.target as HTMLImageElement;
        el.style.visibility = 'hidden';
      }}
    />
  );
}
