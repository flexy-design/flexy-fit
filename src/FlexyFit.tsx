import type { FlexyFitProps } from "./types";
import { useEffect, useState } from "react";
import FlexyFitInternal from "./FlexyFitInternal";

/**
 * FlexyFit is a library that makes it
 * easy to apply responsive layout
 * to elements with fixed size.
 * @link https://github.com/flexy-design/flexy-fit
 */
export const FlexyFit = (props: FlexyFitProps) => {
  const { responsive, breakpoint, children, ...rest } = props;
  const [responsiveView, setResponsiveView] = useState(false);
  const [breakpointView, setBreakpointView] = useState(false);
  const checkResponsive = () => {
    if (!responsive || responsive.length === 0) {
      setResponsiveView(true);
      return;
    }
    if (typeof window === "undefined") return;
    if (responsive.includes("sm") && window.innerWidth <= 640) {
      setResponsiveView(true);
      return;
    }
    if (
      responsive.includes("md") &&
      window.innerWidth <= 768 &&
      window.innerWidth > 640
    ) {
      setResponsiveView(true);
      return;
    }
    if (
      responsive.includes("lg") &&
      window.innerWidth <= 1024 &&
      window.innerWidth > 768
    ) {
      setResponsiveView(true);
      return;
    }
    if (
      responsive.includes("xl") &&
      window.innerWidth <= 1280 &&
      window.innerWidth > 1024
    ) {
      setResponsiveView(true);
      return;
    }
    if (
      responsive.includes("2xl") &&
      window.innerWidth <= 1536 &&
      window.innerWidth > 1280
    ) {
      setResponsiveView(true);
      return;
    }
    if (responsive.includes("2xl") && window.innerWidth > 1536) {
      setResponsiveView(true);
      return;
    }
    setResponsiveView(false);
  };

  const checkBreakpoint = () => {
    if (!breakpoint) {
      setBreakpointView(true);
      return;
    }
    if (typeof window === "undefined") return;

    let condition = true;
    if (breakpoint.width) {
      if (
        breakpoint.width.max !== undefined &&
        breakpoint.width.max !== null &&
        window.innerWidth > breakpoint.width.max
      ) {
        condition = false;
      }
      if (
        breakpoint.width.min !== undefined &&
        breakpoint.width.min !== null &&
        window.innerWidth < breakpoint.width.min
      ) {
        condition = false;
      }
    }

    if (breakpoint.height) {
      if (
        breakpoint.height.max !== undefined &&
        breakpoint.height.max !== null &&
        window.innerHeight > breakpoint.height.max
      ) {
        condition = false;
      }
      if (
        breakpoint.height.min !== undefined &&
        breakpoint.height.min !== null &&
        window.innerHeight < breakpoint.height.min
      ) {
        condition = false;
      }
    }

    setResponsiveView(condition);
  };

  useEffect(() => {
    checkResponsive();
    checkBreakpoint();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", checkResponsive);
    return () => {
      window.removeEventListener("resize", checkResponsive);
    };
  }, [props]);

  return responsiveView && breakpointView ? (
    <FlexyFitInternal {...rest} fitTo="width">
      {children}
    </FlexyFitInternal>
  ) : (
    <></>
  );
};

export default FlexyFit;
