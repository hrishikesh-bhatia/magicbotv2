const sentKeys = new Set();

export const SuppressionManager = {
  isBlocked: (key) => sentKeys.has(key),
  mark: (key) => sentKeys.add(key)
};