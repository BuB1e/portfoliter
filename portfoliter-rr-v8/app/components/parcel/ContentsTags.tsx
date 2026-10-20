interface ContentsTagsProps {
  label: string;
  items: string[];
  className?: string;
}

// Small paper tags listing skills, used on boxes and tracking events.
export function ContentsTags({ label, items, className = "" }: ContentsTagsProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <ul aria-label={label} className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((item) => (
        <li key={item} className="border border-parcel-ink bg-parcel-label px-2 py-0.5 text-[0.85rem] font-stretch-85%">
          {item}
        </li>
      ))}
    </ul>
  );
}
