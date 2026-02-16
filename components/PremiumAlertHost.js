import React from "react";
import PremiumAlertModal from "./PremiumAlertModal";
import { usePremiumAlert } from "../store/usePremiumAlert";

export default function PremiumAlertHost() {
  const alert = usePremiumAlert();

  return (
    <PremiumAlertModal
      visible={alert.visible}
      title={alert.title}
      message={alert.message}
      cancelText={alert.cancelText}
      confirmText={alert.confirmText}
      type={alert.type}  
      onCancel={() => {
        alert.hide();
        if (alert.onCancel) alert.onCancel();
      }}

      onConfirm={() => {
        alert.hide();
        if (alert.onConfirm) alert.onConfirm();
      }}
    />
  );
}
