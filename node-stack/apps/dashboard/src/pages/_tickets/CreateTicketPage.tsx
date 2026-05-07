import { FC } from "react";
import { useNavigate } from "react-router-dom";
import CreateTicketModal from "@features/tickets/components/CreateTicketModal";

const CreateTicketPage: FC = () => {
  const navigate = useNavigate();
  return <CreateTicketModal isOpen onClose={() => navigate("/tickets")} />;
};

export default CreateTicketPage;
