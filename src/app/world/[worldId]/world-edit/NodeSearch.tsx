'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {useDebounce} from 'use-debounce';

import {api} from '@/trpc/react';
import Input from '@components/form/Input';

type NodeSearchProps = {
  worldId: string;
};

const NodeSearch = ({worldId}: NodeSearchProps) => {
  const [query, setQuery] = useState('');
  const [search] = useDebounce(query, 300);

  const [isFocused, setIsFocused] = useState(false);

  const enabled = isFocused && !!query;

  const router = useRouter();

  const {data, error, isLoading} = api.world.findNodes.useQuery(
    {search, worldId},
    {enabled},
  );

  return (
    <div className="relative w-full max-w-md">
      <p className="text-lg">{'Szukaj w świecie'}</p>
      <Input
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        type="text"
        className="mb-4"
        placeholder="Wyszukaj..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {enabled && (
        <div className="absolute left-0 right-0  top-full  z-[9999] rounded-md border border-gray-200  bg-white text-black">
          {isLoading && <p className="p-2">{'Loading...'}</p>}
          {error && (
            <p className="p-2">
              {'Error: '}
              {error.message}
            </p>
          )}
          {data?.length === 0 && <p className="p-2">{'Brak wyników'}</p>}
          {data && (
            <ul>
              {data.map(item => (
                <li
                  key={item.Id}
                  className="cursor-pointer border-b border-gray-200 p-2  hover:bg-gray-100"
                  onMouseDown={() => {
                    router.push(`/world/${worldId}/world-edit/${item.Id}`);
                  }}>
                  <p>
                    <span className="mr-2 text-lg font-bold">{item.Name}</span>
                    {item.WorldNode.type}
                  </p>
                  <p className="text-sm">{item.Id}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeSearch;
