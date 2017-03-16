/* eslint-disable no-console */
export const log = (msg, isError = false) => {
  if (process.env.NODE_ENV === 'test') return;

  if (isError) console.error('[ERROR]', msg);
  else console.log('[INFO]', msg);
};

export const error = msg => {
  log(msg, true);
};
