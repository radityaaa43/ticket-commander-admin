
import { useContext } from "react";
import { TicketContext } from "@/context/TicketContext";

/**
 * Custom hook to access ticket context
 */
export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};
