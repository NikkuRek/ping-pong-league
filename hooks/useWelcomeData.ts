        const players: Player[] = Array.isArray(playersData) ? playersData : playersData.data;
        setPlayerCount(players.length);

        const tournaments: Tournament[] = Array.isArray(tournamentsData) ? tournamentsData : tournamentsData.data;
        const activeTournaments = tournaments.filter(
          (tournament: Tournament) => tournament.status === "Proximo" || tournament.status === "En curso"
        );
