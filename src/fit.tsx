import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useEffect, useRef, useState } from "react";

export type ResponsiveType = "sm" | "md" | "lg" | "xl" | "2xl";

export interface FlexyFitProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The children to be rendered
   */
  children?: ReactNode;
  /**
   * The width of the parent
   */
  width?: number;
  /**
   * The height of the parent
   */
  height?: number;
  /**
   * The type of fit to use
   */
  fitTo?: "width" | "height" | null;
  /**
   * Whether to allow the child to overflow the parent
   */
  overflow?: boolean;
  /**
   * Full width and height
   */
  px?: boolean;
  /**
   * Whether to render a border around the child
   */
  flex?: boolean;
  /**
   * The horizontal origin of the child
   */
  horizontalOrigin?: "left" | "center" | "right";
  /**
   * The vertical origin of the child
   */
  verticalOrigin?: "top" | "center" | "bottom";
  /**
   * The responsive type
   */
  responsive?: ResponsiveType[];
}

/**
 * The FlexyFit component is a component that resizes the child element to fit within the parent element
 * @param {Object} props - The props of the component
 * @param {ReactNode} props.children - The children to be rendered
 * @param {number} props.width - The width of the parent
 * @param {number} props.height - The height of the parent
 * @param {string} props.fitTo - The type of fit to use
 * @param {boolean} props.overflow - Whether to allow the child to overflow the parent
 * @param {boolean} props.flex - Whether to render a border around the child
 * @param {string} props.horizontalOrigin - The horizontal origin of the child
 * @param {string} props.verticalOrigin - The vertical origin of the child
 */
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
    if (ref.current.style.visibility === "hidden")
      ref.current.style.removeProperty("visibility");

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

  useResizeObserver(ref.current!.parentElement, () => {
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

export const FlexyFit = (props: FlexyFitProps) => {
  const { responsive, children, ...rest } = props;
  const [responsiveView, setResponsiveView] = useState(false);
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

  useEffect(() => {
    checkResponsive();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", checkResponsive);
    return () => {
      window.removeEventListener("resize", checkResponsive);
    };
  }, [props]);

  return responsiveView ? (
    <FlexyFitInternal {...rest} fitTo="width">
      {children}
    </FlexyFitInternal>
  ) : (
    <></>
  );
};

export default FlexyFit;
