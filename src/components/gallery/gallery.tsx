import { photosActions, photosSelectors } from "@/features/photos"
import { useAppDispatch, useAppSelector } from "@/hooks"
import { PhotoThumb } from "../photo-thumb";
import { Button } from "../ui/button";

export const Gallery = () => {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(photosSelectors.selectPhotoIds);

  const onClear = () => {
    dispatch(photosActions.clear());
  }

  if (!ids.length)  {
    return <div className="text-sm text-slate-600">Добавь изображения, чтобы начать.</div>;
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
    >
      <Button onClick={onClear}>Очистить</Button>
      {ids.map(id => <PhotoThumb key={id} id={id} />)}
    </div>
  );
}
