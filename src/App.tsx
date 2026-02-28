import { useSettings } from "@/contexts/SettingsContext";
import { Clock } from "./components/clock";
import Settings from "./components/settings";

export function App() {
  const { tint } = useSettings();

  return (
    <div className="relative flex w-full min-h-screen items-center justify-center overflow-hidden">
      {/* Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/wallpaper.jpg)" }}
      />
      {/* Wallpaper tint */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `color-mix(in oklch, var(--background) ${tint}%, transparent)`,
        }}
      />
      <Clock />
      <Settings />
    </div>
  );
}

export default App;
