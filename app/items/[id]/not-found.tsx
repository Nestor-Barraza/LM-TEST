import Link from 'next/link';
import { EmptyState } from '@/components/molecules/EmptyState';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto">
      <EmptyState
        title="Producto no encontrado"
        message="El producto que buscas no existe o no está disponible"
      />
      <div className="text-center mt-4">
        <Link
          href="/"
          className="text-ml-blue hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
