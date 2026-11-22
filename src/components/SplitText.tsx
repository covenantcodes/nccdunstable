import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Wraps every word in a masked span so a heading can be revealed line by line
 * (see `useScrollReveal`). Place it inside a heading that carries `data-lines`.
 * Keeps inline markup such as <em> and <br />.
 */
function split(children: ReactNode): ReactNode {
  return Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((part, i) =>
          !part || /^\s+$/.test(part) ? (
            part
          ) : (
            <span className="sw" key={i}>
              <span className="sw-in">{part}</span>
            </span>
          ),
        );
    }
    if (isValidElement(child) && child.type !== "br") {
      const el = child as ReactElement<{ children?: ReactNode }>;
      return cloneElement(el, undefined, split(el.props.children));
    }
    return child;
  });
}

export function SplitText({ children }: { children: ReactNode }) {
  return <>{split(children)}</>;
}
