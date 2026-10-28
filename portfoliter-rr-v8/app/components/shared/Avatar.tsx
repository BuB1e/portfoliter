import { initials } from "~/lib/format";

interface AvatarProps {
  url: string | null;
  name: string;
  // Classes for the photo; also used for the fallback unless fallbackClassName is given.
  className?: string;
  fallbackClassName?: string;
}

// The profile photo, or the owner's initials when there is none, so a design never shows a broken
// image or an empty frame.
export function Avatar({ url, name, className, fallbackClassName }: AvatarProps) {
  if (url) {
    return <img src={url} alt={`Photo of ${name}`} className={className} />;
  }
  return (
    <span role="img" aria-label={`Initials of ${name}`} className={fallbackClassName ?? className}>
      {initials(name)}
    </span>
  );
}
