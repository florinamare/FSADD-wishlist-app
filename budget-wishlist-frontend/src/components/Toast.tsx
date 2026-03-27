interface Props {
  message: string | null;
}

export const Toast = ({ message }: Props) => {
  if (!message) return null;

  return (
    <div className="toast">
      <span className="toast-icon">⚠</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};
