export default function VideoGrid() {
  const participants = [
    {
      id: 1,
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      isMuted: false,
      isSpeaking: false,
    },
    {
      id: 2,
      name: "Mai Vũ",
      avatar: "https://i.pravatar.cc/150?u=1",
      isMuted: true,
      isSpeaking: false,
    },
    {
      id: 3,
      name: "Trần Minh Chi",
      avatar: "https://i.pravatar.cc/150?u=3",
      isMuted: false,
      isSpeaking: true,
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "https://i.pravatar.cc/150?u=5",
      isMuted: false,
      isSpeaking: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-6xl mx-auto h-full max-h-[calc(100vh-140px)] p-4">
      {participants.map((p) => (
        <div
          key={p.id}
          className={`relative bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center group ${
            p.isSpeaking ? "ring-2 ring-green-500" : ""
          }`}
        >
          {/* Avatar / Camera Placeholder */}
          <div className="flex flex-col items-center">
            <img
              src={p.avatar}
              alt={p.name}
              className="w-24 h-24 rounded-full mb-4 ring-4 ring-slate-700"
            />
          </div>

          {/* Name Label */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
            {p.name}
            {p.isMuted && (
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
                <line
                  x1="1"
                  y1="1"
                  x2="23"
                  y2="23"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>

          {/* Speaking Indicator */}
          {p.isSpeaking && (
            <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 p-1.5 rounded-full animate-pulse">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
