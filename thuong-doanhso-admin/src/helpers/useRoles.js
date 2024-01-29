import nextId from "react-id-generator";
import { formatArray } from "./formatArray";

const hasRolesAuth = (data) => {
  let newHasRoles = [];
  if (data && data?.groups) {
    newHasRoles = data.groups.map((x) => ({
      ...x,
      name: x.group + nextId(),
      children: x.rights
        ? x.rights.map((r) => ({
            ...r,
            name: r.name, // + useId()
            children: r?.subs || null,
          }))
        : [],
    }));
  }

  return { hasRoles: newHasRoles };
};

const getHasRole = (Roles, CrStocks) => {
  let hasRight = Roles?.hasRight || false;
  let StockRoles = Roles?.stocksList
    ? Roles?.stocksList.map((x) => ({ ...x, label: x.Title, value: x.ID }))
    : [];

  if (hasRight && !Roles.IsAllStock) {
    hasRight = StockRoles.some((x) => x.ID === CrStocks?.ID);
  }
  return {
    hasRight,
    StockRoles,
    StockRolesAll: Roles?.IsAllStock
      ? [{ label: "Hệ thống", value: 0 }, ...StockRoles]
      : StockRoles,
    IsStocks: Roles?.IsAllStock || false,
  };
};

export const useRoles = (nameRoles) => {
  const isMultiple = Array.isArray(nameRoles);
  const { auth, CrStocks } = {
    auth: window?.top?.Info,
    CrStocks: {
      ID: window.top?.Info?.CrStockID,
    },
  };

  let result = {};

  const { hasRoles } = hasRolesAuth(auth?.rightTree);
  if (!isMultiple) {
    const hasRolesItem = formatArray.findNodeByName(hasRoles, nameRoles);
    if (hasRolesItem) {
      result[nameRoles] = { ...getHasRole(hasRolesItem, CrStocks) };
    } else {
      result[nameRoles] = { hasRight: false, StockRoles: [] };
    }
  } else {
    for (let key of nameRoles) {
      const hasRolesItem = formatArray.findNodeByName(hasRoles, key);
      if (hasRolesItem) {
        result[key] = { ...getHasRole(hasRolesItem, CrStocks) };
      } else {
        result[key] = {
          hasRight: false,
          StockRoles: [],
        };
      }
    }
  }
  return result;
};
