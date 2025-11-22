import { Spinner } from '@/components/atoms/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    </div>
  );
}
