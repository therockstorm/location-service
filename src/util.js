export const log = (msg, isError = false) => {
  if (process.env.NODE_ENV === 'test') return;

  if (isError) {
    console.error('[ERROR]', msg); // eslint-disable-line no-console
  } else {
    console.log('[INFO]', msg); // eslint-disable-line no-console
  }
};

export const error = msg => {
  log(msg, true);
};
