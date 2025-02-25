import React from "react";

interface CardProps {
  title: React.ReactNode;
  body: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, body, className = "" }) => {
  return (
    <div className={`card border py-7 px-6 min-w-[428px] ${className}`}>
      <div className="card-title text-[18px] mb-3">{title}</div>
      <p className="card-body text-[15px] !p-0">{body}</p>
    </div>
  );
};

export default Card;
