"use client";

import "./NoebCard.css";
import ProfileCard from "@/components/ProfileCard";

export default function NoebCard() {
  return (
    <div className="noeb-card">
    <div className="noeb-rating">
    <strong>99</strong>
    <span>GK</span>
    </div>

    <div className="noeb-club">
    <img
    src="/players/noeb/team.png"
    alt="Escudo do clube"
    draggable={false}
    />
    </div>

    <ProfileCard
    name="NOEB"
    title="99 OVR • GK"
    handle="NOEB"
    status="GOLEIRO"
    avatarUrl="/players/noeb/noeb.png"
    iconUrl="/players/noeb/team.png"
    showUserInfo={false}
    enableTilt={true}
    enableMobileTilt={false}
    behindGlowEnabled={true}
    behindGlowColor="rgba(77, 135, 92, 0.12)"
    behindGlowSize="32%"
    innerGradient={`
      linear-gradient(
        145deg,
        rgba(3, 16, 12, 0.99) 0%,
                      rgba(5, 43, 32, 0.98) 55%,
                      rgba(43, 35, 15, 0.96) 100%
      )
      `}
      />

      <div className="noeb-name">
      <strong>NOEB</strong>
      <span>GOLEIRO</span>
      </div>
      </div>
  );
}
