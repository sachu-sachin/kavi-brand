"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type ConfirmButtonProps = React.ComponentProps<typeof Button> & {
  message?: string;
};

export function ConfirmButton({
  message = "Are you sure?",
  onClick,
  ...props
}: ConfirmButtonProps) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
