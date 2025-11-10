import type { Metadata } from "next";
import InProgressTournaments from "@/components/InProgressTournaments";
import UpcomingTournaments from "@/components/UpcomingTournaments";

export const metadata: Metadata = {
  title: "Torneos — LPP",
  description: "Listado de torneos en curso y próximos del club",
}

export default function TournamentsPage() {
  return (
    <div className="space-y-8">
      <InProgressTournaments />
      {/* <UpcomingTournaments /> dddd*/}
    </div>
  );
}
