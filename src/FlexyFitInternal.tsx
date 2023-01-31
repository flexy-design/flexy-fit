import type { FlexyFitProps } from "./types";
import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useRef, useState } from "react";

const FlexyFitInternal = (props: FlexyFitProps) => {
  const {
    children,
    className,
    width: _width,
    height: _height,
    fitTo: _fitTo,
    overflow,
    flex,
    px,
    horizontalOrigin,
    verticalOrigin,
    responsive,
    ...rest
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [initialWidth, setInitialWidth] = useState(null as number | null);
  const [initialHeight, setInitialHeight] = useState(null as number | null);
  const [fullParentWidth, setFullParentWidth] = useState(null as number | null);
  const [fullParentHeight, setFullParentHeight] = useState(
    null as number | null
  );

  const fitTo = _fitTo ?? "width";
  const width = _width ?? initialWidth;
  const height = _height ?? initialHeight;

  const parentResize = () => {
    if (!ref.current) return;
    const parent = ref.current?.parentElement;

    if (parent && parent.getBoundingClientRect) {
      const { width, height } = parent.getBoundingClientRect();
      setFullParentWidth(width);
      setFullParentHeight(height);
    }
  };

  const resize = () => {
    if (!ref.current) return;

    if (ref.current.clientWidth !== 0 && ref.current.clientHeight !== 0) {
      if (initialWidth === null) setInitialWidth(ref.current.clientWidth);
      if (initialHeight === null) setInitialHeight(ref.current.clientHeight);
    }

    const parent = ref.current?.parentElement;
    if (
      parent &&
      parent.getBoundingClientRect &&
      fullParentWidth === null &&
      fullParentHeight === null
    ) {
      const { width, height } = parent.getBoundingClientRect();
      setFullParentWidth(width);
      setFullParentHeight(height);
    }

    if (width === null || height === null) return;

    if (initialWidth === null || initialHeight === null) return;
    if (ref.current.style.visibility === "hidden") {
      ref.current.style.removeProperty("visibility");
      ref.current.style.removeProperty("opacity");
    }

    const { clientWidth, clientHeight } = ref.current;
    if (fitTo === "width" && ref.current.parentElement) {
      const resizedParentHeight = ref.current.parentElement.clientHeight;
      const resizedChildHeight = height * (clientWidth / width);

      if (!overflow && resizedChildHeight > resizedParentHeight) {
        ref.current.style.transform = `scale(${clientHeight / height})`;
        if (flex) keepSyncRatio("height");
      } else {
        ref.current.style.transform = `scale(${clientWidth / width})`;
        if (flex) keepSyncRatio("width");
      }
    } else if (fitTo === "height" && ref.current.parentElement) {
      const resizedParentWidth = ref.current.parentElement.clientWidth;
      const resizedChildWidth = width * (clientHeight / height);

      if (!overflow && resizedChildWidth > resizedParentWidth) {
        ref.current.style.transform = `scale(${clientWidth / width})`;
        if (flex) keepSyncRatio("width");
      } else {
        ref.current.style.transform = `scale(${clientHeight / height})`;
        if (flex) keepSyncRatio("height");
      }
    }

    const childElement = ref.current.children[0] as HTMLDivElement;
    if (childElement) {
      childElement.style.flexShrink = "0";
    }
  };

  const keepSyncRatio = (fitTo: "width" | "height") => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    if (width === null || height === null) return;
    const originRatio = width / height;

    const resizedParentHeight = ref.current.parentElement.clientHeight;
    const resizedParentWidth = ref.current.parentElement.clientWidth;
    const resizedParentRatio = resizedParentWidth / resizedParentHeight;

    if (fitTo === "width") {
      if (originRatio !== resizedParentRatio) {
        const changedRatio = originRatio / resizedParentRatio;

        const childElement = ref.current.children[0] as HTMLDivElement;
        if (childElement) {
          childElement.style.width = `${width}px`;
          childElement.style.height = `${height * changedRatio}px`;
        }
      }
    } else if (fitTo === "height") {
      if (originRatio !== resizedParentRatio) {
        const changedRatio = resizedParentRatio / originRatio;

        const childElement = ref.current.children[0] as HTMLDivElement;
        if (childElement) {
          childElement.style.height = `${height}px`;
          childElement.style.width = `${width * changedRatio}px`;
        }
      }
    }
  };

  useEffect(() => {
    resize();
  }, [props]);

  useResizeObserver(ref, () => {
    resize();
  });

  useResizeObserver(ref.current?.parentElement ?? null, () => {
    parentResize();
  });

  return (
    <div
      ref={ref}
      className={className}
      {...rest}
      style={{
        ...(initialWidth !== null &&
          px &&
          fullParentWidth && { width: fullParentWidth }),
        ...(initialHeight !== null &&
          px &&
          fullParentHeight && { height: fullParentHeight }),
        ...(initialHeight !== null && !px && { width: "100%", height: "100%" }),
        visibility: "hidden",
        opacity: 0,
        transformOrigin: `${verticalOrigin ?? "center"} ${
          horizontalOrigin ?? "center"
        }`,
        ...((horizontalOrigin ?? "center") === "center" && {
          display: "flex",
          justifyContent: "center",
        }),
        ...((verticalOrigin ?? "center") === "center" && {
          display: "flex",
          alignItems: "center",
        }),
      }}
    >
      {children}
    </div>
  );
};

export default FlexyFitInternal;
