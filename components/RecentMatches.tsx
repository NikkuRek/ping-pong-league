// import type React from "react"

// const MatchCard: React.FC<{ match: any }> = ({ match }) => {
//   return (
//     <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 space-y-4">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-3 text-left">
//           <img
//             src={match.player1.avatar || "/placeholder.svg"}
//             alt={match.player1.name}
//             className="w-12 h-12 rounded-full"
//           />
//           <div>
//             <p className="font-bold text-white">{match.player1.name}</p>
//             <p className="text-xs text-slate-400">{match.player1.major}</p>
//           </div>
//         </div>
//         <div className="text-center">
//           <p className="text-2xl font-bold">
//             <span className={match.score1 > match.score2 ? "text-white" : "text-slate-400"}>{match.score1}</span>
//             <span className="text-slate-500 mx-2">VS</span>
//             <span className={match.score2 > match.score1 ? "text-white" : "text-slate-400"}>{match.score2}</span>
//           </p>
//         </div>
//         <div className="flex items-center gap-3 text-right">
//           <div>
//             <p className="font-bold text-white">{match.player2.name}</p>
//             <p className="text-xs text-slate-400">{match.player2.major}</p>
//           </div>
//           <img
//             src={match.player2.avatar || "/placeholder.svg"}
//             alt={match.player2.name}
//             className="w-12 h-12 rounded-full"
//           />
//         </div>
//       </div>
//       <div className="text-center">
//         <p className="text-sm text-slate-400">{match.tournamentName}</p>
//         <p className="text-xs text-slate-500">{match.timeAgo}</p>
//       </div>
//       <div className="flex justify-center gap-2">
//         {match.sets.map((set, index) => (
//           <div
//             key={index}
//             className={`px-3 py-1 rounded text-sm font-semibold ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
//           >
//             {set.p1 > set.p2 ? `${set.p1}-${set.p2}` : `${set.p2}-${set.p1}`}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// const RecentMatches: React.FC = () => {
//   return (
//     <section>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold text-white">Partidos Recientes</h2>
//         <a href="#" className="text-sm text-purple-400 font-semibold hover:text-purple-300">
//           Ver Historial
//         </a>
//       </div>
//       <div className="space-y-4">
//         {matchesData.map((m) => (
//           <MatchCard key={m.id} match={m} />
//         ))}
//       </div>
//     </section>
//   )
// }

// export default RecentMatches
