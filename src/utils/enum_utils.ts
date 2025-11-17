export function isValidProjectStatus(status: string): boolean {
  const validStatuses = ["ALL", "OPEN", "CLOSED", "DONE"];
  return validStatuses.includes(status.toUpperCase());
}
