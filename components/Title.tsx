import React from "react";
import clsx from "clsx";

type TitleProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements; // Allows changing the tag dynamically
};

export const Title: React.FC<TitleProps> = ({
  children,
  className,
  as: Tag = "h3",
}) => {
  return (
    <Tag className={clsx("text-lg font-bold", className ?? "mb-4")}>
      {children}
    </Tag>
  );
};
