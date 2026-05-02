import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModalInner: FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Create Ticket</h2>
        <p>Ticket creation form would go here</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 rounded">Close</button>
      </div>
    </div>
  );
};

const CreateTicketPage: FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/tickets");
  };

  return <CreateTicketModalInner isOpen={true} onClose={handleClose} />;
};

export default CreateTicketPage;