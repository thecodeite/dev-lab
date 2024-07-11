export function getClientId() {
  const cachedId = localStorage.getItem('dev-lab-clientId')
  if (typeof cachedId === 'string' && cachedId.length > 0) {
    return cachedId
  }
  const newId = Math.floor(36 ** 10 * Math.random())
    .toString(36)
    .padStart(10, '0')
  localStorage.setItem('dev-lab-clientId', newId)
  return newId
}
