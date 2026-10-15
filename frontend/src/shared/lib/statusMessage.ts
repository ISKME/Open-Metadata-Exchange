export const StatusMessage = window['StatusMessage'] || {
  success: (msg: string) => {
    console.log('Success:', msg);
  },
  error: (msg: string) => {
    console.error(msg);
  }
};
