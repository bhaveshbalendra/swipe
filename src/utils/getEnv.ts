//Utility function to get environment variables
export function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value || value === "" || value === undefined || value === null) {
    if (defaultValue === undefined || defaultValue === null) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value;
}
