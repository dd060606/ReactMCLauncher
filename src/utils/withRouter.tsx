import { ComponentType } from "react";
import { useNavigate } from "react-router-dom";

export const withRouter = <P extends object>(Component: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};
