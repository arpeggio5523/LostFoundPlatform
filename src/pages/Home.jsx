import { useEffect } from "react";
import { useForceLightMode } from "../hooks/useForceLightMode";
import LostFoundHero from "../components/LostFoundHero";
import NavBar from "../components/NavBar";
import { getCurrentUserId } from "../services/authState";

export default function Home() {
  useForceLightMode();

  return (
    <div>
      <NavBar />
      <LostFoundHero />
    </div>
  );
}