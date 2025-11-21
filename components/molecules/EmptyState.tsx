interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
    </div>
  );
};
