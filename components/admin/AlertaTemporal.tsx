"use client";

import { useEffect, useState } from "react";

type Props = {
  mensaje: string;
};

export default function AlertaTemporal({
  mensaje,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-4 rounded bg-green-100 p-4 text-green-800">
      {mensaje}
    </div>
  );
}