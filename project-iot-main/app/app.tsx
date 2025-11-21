// App.tsx atau index.tsx
import React, { useState } from "react";
import WelcomeScreen from "../components/ui/welcome";
import LoginScreen from"../components/ui/login";
import RegisterScreen from "../components/ui/register";
import HomeScreen from "../components/ui/HomeScreen";

type Screen = "welcome" | "login" | "register" | "home";

export default function App() {
  // PASTIKAN INI 'welcome' bukan 'home'
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onContinue={() => setCurrentScreen("login")} />;

      case "login":
        return (
          <LoginScreen
            onLogin={() => setCurrentScreen("home")}
            onSignUp={() => setCurrentScreen("register")}
          />
        );

      case "register":
        return (
          <RegisterScreen
            onRegister={() => setCurrentScreen("login")}
            onSignIn={() => setCurrentScreen("login")}
          />
        );

      case "home":
        return <HomeScreen />;

      default:
        return <WelcomeScreen onContinue={() => setCurrentScreen("login")} />;
    }
  };

  return renderScreen();
}
