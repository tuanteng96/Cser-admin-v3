import clsx from "clsx";
import { components } from "react-select";

const ServiceOptionColor = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <span className={clsx(!data.IsRootPublic && "text-danger")}>
        {data.label}
      </span>
    </components.Option>
  );
};

export { ServiceOptionColor };
