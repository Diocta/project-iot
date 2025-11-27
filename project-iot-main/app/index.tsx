import { useRouter } from "expo-router";
import WelcomeScreen from "../components/ui/welcome";

export default function Index() {
  const router = useRouter();

  return <WelcomeScreen onContinue={() => router.replace("/(tabs)")} />;
}
