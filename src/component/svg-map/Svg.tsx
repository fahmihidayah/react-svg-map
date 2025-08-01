import React, { forwardRef } from "react";

export type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  id?: string;
};

export const SvgComponent = forwardRef<SVGSVGElement, SvgComponentProps>(
  ({ children, ...props }, ref) => {
    return (
      <svg ref={ref} {...props}>
        {children}
      </svg>
    );
  }
);

SvgComponent.displayName = "SvgComponent";
