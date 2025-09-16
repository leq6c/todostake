import * as React from "react";

const TABLET_BREAKPOINT_FROM = 768;
const TABLET_BREAKPOINT_TO = 920;

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${TABLET_BREAKPOINT_FROM}px) and (max-width: ${
        TABLET_BREAKPOINT_TO - 1
      }px)`
    );
    const onChange = () => {
      setIsTablet(
        window.innerWidth >= TABLET_BREAKPOINT_FROM &&
          window.innerWidth < TABLET_BREAKPOINT_TO
      );
    };
    mql.addEventListener("change", onChange);
    setIsTablet(
      window.innerWidth >= TABLET_BREAKPOINT_FROM &&
        window.innerWidth < TABLET_BREAKPOINT_TO
    );
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTablet;
}
