import { useState, useEffect } from "react";
import type { PlayerForList, Career } from "@/types";

const transformPlayerData = (
  data: any,
  careerMap: { [key: number]: string }
): PlayerForList[] => {
  const players = Array.isArray(data) ? data : data.data;

  if (!Array.isArray(players)) {
    console.error("transformPlayerData couldn't find a players array in data:", data);
    return [];
  }

  return players
    .sort((a, b) => (b.aura ?? 0) - (a.aura ?? 0))
    .map((player) => ({
      ...player,
      aura: player.aura ?? 0,
      avatar: `https://picsum.photos/seed/player${player.ci}/40/40`,
      career_name: careerMap[player.career_id] ?? "N/A",
    }));
};

export const usePlayers = () => {
  const [players, setPlayers] = useState<PlayerForList[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';
      const cleaned = rawApiUrl.replace(/^["']+|["']+$/g, '').trim();
      const apiUrl = cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`;
 
        const [playersResponse, careersResponse] = await Promise.all([
          fetch(`${apiUrl}/player`),
          fetch(`${apiUrl}/career`),
        ]);

        if (!playersResponse.ok) {
          throw new Error(`Player API HTTP error! status: ${playersResponse.status}`);
        }
        if (!careersResponse.ok) {
          throw new Error(`Career API HTTP error! status: ${careersResponse.status}`);
        }

        const playersData = await playersResponse.json();
        const careersResponseData = await careersResponse.json();
        const careersData: Career[] = Array.isArray(careersResponseData) ? careersResponseData : careersResponseData.data; // Assuming it's either a direct array or nested under 'data'

        if (!Array.isArray(careersData)) {
            throw new Error("Career data is not in the expected format.");
        }
        setCareers(careersData);
        
        const careerMap = careersData.reduce((map: { [key: number]: string }, career) => {
          map[career.career_id] = career.name_career;
          return map;
        }, {});

        const formattedData = transformPlayerData(playersData, careerMap);
        setPlayers(formattedData);
      } catch (e) {
        setError(e as Error);
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { players, careers, loading, error };
};
