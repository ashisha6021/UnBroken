export function getDisplayName(fullName) {
  if (!fullName) return "Champ";

  // Split by spaces and remove extra empty parts
  const parts = fullName.trim().split(/\s+/);

  // Take only first 2 words
  return parts.slice(0, 2).join(" ");
}
