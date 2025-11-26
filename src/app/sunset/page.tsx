"use client";

import Image from "next/image";
import "./sunset.css";

export default function SunsetPage() {
  return (
    <div className="sunset-container">
      <div className="sunset-image-wrapper">
        <Image
          src="/images/hh_sunset.png"
          alt="Heavy Helms Sunset"
          fill
          className="sunset-image"
          priority
        />
      </div>
      
      <div className="sunset-content">
        <h1 className="sunset-title">
          Thank You for Playing
        </h1>
        
        <p className="sunset-subtitle">
          Heavy Helms on Shape Network has come to an end.
        </p>
        
        <p className="sunset-message">
          We're grateful for every warrior who joined us on this journey. 
          The battles may be over, but the memories and friendships forged 
          in the arena will last forever.
        </p>
        
        <p className="sunset-farewell">
          Until we meet again, warriors. ⚔️
        </p>
      </div>
    </div>
  );
}