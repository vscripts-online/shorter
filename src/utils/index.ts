export function generateAuthCallbackURL() {
  const url = new URL(location.href)
  return url.toString()
}