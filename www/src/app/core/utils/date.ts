export function formatStrDate(strDate: string): string {
  if (strDate === null) {
    return '';
  }

  let formated = '';

  const date = new Date(strDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  formated += day < 10 ? '0' + day : day;
  formated += '.' + (month < 10 ? '0' + month : month);
  formated += '.' + date.getFullYear();

  return formated;
}
