export const systemKeys = {
  all: ['system'] as const,
  backup: () => [...systemKeys.all, 'backup'] as const,
  restore: () => [...systemKeys.all, 'restore'] as const,
}
