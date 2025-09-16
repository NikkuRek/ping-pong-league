import InProgressTournaments from "@/components/InProgressTournaments";
import UpcomingTournaments from "@/components/UpcomingTournaments";

export default function TournamentsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Torneos</h1>
      <InProgressTournaments />
      <UpcomingTournaments />
    </div>
  );
}
