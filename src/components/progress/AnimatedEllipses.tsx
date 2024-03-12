import { useEffect, useState } from "react";

export const AnimatedEllipses = () => {
  const [text, setText] = useState(".");
  useEffect(() => {
    const handle = setInterval(() => {
      setText((txt) => "".padStart((txt.length % 3) + 1, "."));
    }, 800);

    return () => clearInterval(handle);
  }, []);

  return <>{text}</>;
};
