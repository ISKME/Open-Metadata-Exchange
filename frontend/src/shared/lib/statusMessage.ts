// Minimal stand-in: the original module was never committed upstream.
export const StatusMessage = {
  error(message: string) {
    window.alert(message);
  },
  success(message: string) {
    window.alert(message);
  },
};
