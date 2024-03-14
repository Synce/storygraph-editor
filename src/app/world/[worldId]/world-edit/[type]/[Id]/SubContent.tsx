import Link from 'next/link';
import {useParams} from 'next/navigation';

type SubContentProps = {
  name?: string | null;
  GivenId: string;
  Id: string;
  type: 'character' | 'item' | 'narration';
};
const SubContent = ({name, GivenId, type, Id}: SubContentProps) => {
  const {worldId} = useParams();

  return (
    <div className="bg-gray-700">
      <p>{name}</p>
      <p>{GivenId}</p>
      <p>{type}</p>
      <Link
        className="z-10 bg-red-500"
        href={`/world/${worldId as string}/world-edit/${type}/${Id}`}>
        {'EDYTUJ'}
      </Link>
    </div>
  );
};

export default SubContent;
