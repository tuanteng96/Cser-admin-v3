const formatArray = {
  useInfiniteQuery: (page, key = "data") => {
    let newPages = [];
    if (!page || !page[0]) return newPages;
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x);
      }
    }
    return newPages;
  },
  findNodeByName: (data, name) => {
    let response = null;
    let findNameItem = (tree) => {
      let result = null;
      if (tree.name === name || tree?.name_and_group === name) {
        return tree;
      }

      if (Array.isArray(tree.children) && tree.children.length > 0) {
        tree.children.some((node) => {
          result = findNameItem(node);
          return result;
        });
      }
      return result;
    };
    if (!data) return null;
    for (let item of data) {
      if (findNameItem(item)) {
        response = findNameItem(item);
        break;
      }
    }
    return response;
  },
  arrayMove: (array, oldIndex, newIndex) => {
    if (newIndex >= array.length) {
      var k = newIndex - array.length + 1;
      while (k--) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array;
  },
  sumTotal: (array, key) => array.reduce((a, b) => a + (b[key] || 0), 0),
  sumTotalNested: ({ Items, key, name }) => {
    let total = 0;

    for (let item of Items) {
      if (item.Title && item.Title === key) {
        if (typeof item["Value"] !== "undefined") {
          total += item["Value"][name];
        } else if (typeof item[name] !== "undefined") {
          total += item[name];
        }
      } else {
        if (item?.Groups || item?.Keys) {
          total += formatArray.sumTotalNested({
            key,
            Items: item?.Groups || item?.Keys,
            name,
          });
        }
      }
    }
    return total;
  },
};

const hasRolesAuth = (data) => {
  let newHasRoles = [];
  if (data && data?.groups) {
    newHasRoles = data.groups.map((x) => ({
      ...x,
      name: x.group,
      children: x.rights
        ? x.rights.map((r) => ({
            ...r,
            name: r.name,
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
    hasRight = StockRoles.some((x) => x.ID === CrStocks.ID);
  }
  return {
    hasRight,
    StockRoles,
    StockRolesAll: Roles?.IsAllStock
      ? [{ label: "Hệ thống", value: 778 }, ...StockRoles]
      : StockRoles,
    IsStocks: Roles?.IsAllStock || false,
  };
};

export const useRoles = (nameRoles, CrStocks = window?.top?.Info?.CrStocks) => {
  
  const isMultiple = Array.isArray(nameRoles);
  const { rightTree } = window?.top?.Info;
  
  let result = {};

  const { hasRoles } = hasRolesAuth(rightTree);

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
