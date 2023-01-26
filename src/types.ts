import { ReactNode } from "react";

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
  /**
   * The breakpoint at which
   * the component is displayed.
   * This property can be set in
   * more detail than the responsive property.
   *
   * @example
   * breakpoint={{
   *  width: {
   *    min: 640, // greater than 640px
   *    max: 1024, // less than 1024px
   *  },
   *  height: {
   *    min: 768, // greater than 768px
   *    max: 1280, // less than 1280px
   *  },
   * }}
   */
  breakpoint?: {
    width?: {
      min?: number;
      max?: number;
    };
    height?: {
      min?: number;
      max?: number;
    };
  };
}
