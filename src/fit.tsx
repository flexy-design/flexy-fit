import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Short for constructing a responsive layout.
 *
 *     'sm':  less than 640px
 *     'md':  greater than 640px and less than 768px
 *     'lg':  greater than 768px and less than 1024px
 *     'xl':  greater than 1024px and less than 1280px
 *     '2xl':  greater than 1280px
 */
export type ResponsiveType = "sm" | "md" | "lg" | "xl" | "2xl";

export interface FlexyFitProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Children element to be resized and displayed.
   */
  children?: ReactNode;
  /**
   * The width of the parent,
   * If you do not specify the width,
   * FlexyFit will measure and utilize
   * the width of the children element.
   *
   * If the size of the children
   * element is not fixed,
   * it must be specified to work properly.
   */
  width?: number | null;
  /**
   * The height of the parent,
   * If you do not specify the height,
   * FlexyFit will measure and utilize
   * the height of the children element.
   *
   * If the size of the children
   * element is not fixed,
   * it must be specified to work properly.
   */
  height?: number | null;
  /**
   * Decide whether to fit the width or height.
   * Significant only when overflow is true.
   */
  fitTo?: "width" | "height" | null;
  /**
   * Whether to allow the child
   * to overflow the parent.
   * For example, it is useful to create
   * a scrollable object that
   * fills the entire screen.
   */
  overflow?: boolean;
  /**
   * Fill width and height with px.
   * If you don't specify a px properties
   * FlexyFit will default to 100%
   * (both of width and height).
   *
   * However, if you're using FlexyFit
   * to fill the entire screen or
   * if you need to adjust it to fit
   * the screen using Ctrl +/-,
   * it's helpful to use px.
   */
  px?: boolean;
  /**
   * Adjust the ratio so that the size
   * ratio of the element is
   * appropriate for the screen.
   *
   * Use flex properties within the child element
   * only if it is possible to respond to it.
   */
  flex?: boolean;
  /**
   * The horizontal origin of the child (Default is center)
   */
  horizontalOrigin?: "left" | "center" | "right";
  /**
   * The vertical origin of the child (Default is center)
   */
  verticalOrigin?: "top" | "center" | "bottom";
  /**
   * Displays the component only in the selected size.
   *
   *     'sm':  less than 640px
   *     'md':  greater than 640px and less than 768px
   *     'lg':  greater than 768px and less than 1024px
   *     'xl':  greater than 1024px and less than 1280px
   *     '2xl':  greater than 1280px
   *
   * @example
   * responsive={['sm']} // less than 640px
   * responsive={['md', 'lg']} // greater than 640px and less than 1024px
   * responsive={['xl', '2xl']} // greater than 1024px
   */
  responsive?: ResponsiveType[];
}

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

/**
 * FlexyFit is a library that makes it
 * easy to apply responsive layout
 * to elements with fixed size.
 * @link https://github.com/flexy-design/flexy-fit
 */
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
