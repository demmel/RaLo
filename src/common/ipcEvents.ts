export type IpcEvents = {
  onboarding_complete: { path: string };
  resize: { height: number };
  create_log: { text: string };
};
