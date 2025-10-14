import dayjs from 'dayjs'

export function toLocalISO(dt) {
  // Format without timezone 'Z' to match Spring LocalDateTime.parse
  return dayjs(dt).format('YYYY-MM-DDTHH:mm:ss')
}
