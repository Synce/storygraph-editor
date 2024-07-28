import {type ReactElement} from 'react';

import Crumb from './Crumb';

type BreadcrumbsProps<T> = {
  data: T[];
  lastItemName?: string;
  onItemClick: (item: T) => void;
  keyExtractor: (item: T) => number;
  nameExtractor: (item: T) => string;
};

const Breadcrumbs = <T,>({
  data,
  onItemClick,
  keyExtractor,
  nameExtractor,
  lastItemName,
}: BreadcrumbsProps<T>): ReactElement => (
  <div className="flex flex-wrap items-center">
    {data.map(item => {
      return (
        <Crumb
          onItemClick={onItemClick}
          item={item}
          key={keyExtractor(item)}
          label={nameExtractor(item)}
        />
      );
    })}
    {lastItemName && <Crumb isLast label={lastItemName} />}
  </div>
);

export default Breadcrumbs;
