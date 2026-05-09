import CreateTicketModal from "@features/tickets/components/CreateTicketModal";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const CreateTicketPage: FC = () => {
  const navigate = useNavigate();
  return <CreateTicketModal isOpen onClose={() => navigate("/tickets")} />;
};

export default CreateTicketPage;
