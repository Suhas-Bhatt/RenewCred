declare module "react-katex" {
  import { FC } from "react";
  interface KaTeXProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }
  export const BlockMath: FC<KaTeXProps>;
  export const InlineMath: FC<KaTeXProps>;
}
