import {type ReactElement} from 'react';
import {CgArrowLongRight} from 'react-icons/cg';

const Crumb = <T,>({
  item,
  label,
  isLast,
  onItemClick,
}: {
  item?: T;
  label: string;
  isLast?: boolean;
  onItemClick?: (item: T) => void;
}): ReactElement => (
  <div
    onClick={() => {
      if (item && onItemClick) onItemClick(item);
    }}
    className="flex flex-row items-center py-1">
    <p
      className={`px-2 text-xl ${
        isLast ? 'font-bold' : 'cursor-pointer hover:text-slate-300'
      }`}>
      {label}
    </p>
    {!isLast && <CgArrowLongRight className="h-3 w-3" />}
  </div>
);

export default Crumb;
