import { useToast } from "../store/useToast";

export function showAlarmToast1(message) {
  const { showToast } = useToast.getState();
  showToast(message);
}