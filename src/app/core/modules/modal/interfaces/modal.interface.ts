import { Type } from '@angular/core';

export type ModalType = 'error' | 'warning' | 'success' | 'info';
export type ModalAction = 'ok' | 'close' | 'back';

export interface Modal {
  title?: string;
  subtitle?: string;
  type?: ModalType;
  buttons?: ModalButtons;
  okLabel?: string;
  closeLabel?: string;
  data?: unknown;
  component?: Type<unknown>;
}

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  type?: ModalType;
  buttons?: ModalButtons;
  okLabel?: string;
  closeLabel?: string;
  data?: unknown;
  component?: Type<unknown>;
}

export interface ModalButtons {
  okButton?: boolean;
  closeButton?: boolean;
  backButton?: boolean;
}

export interface ModalState extends ModalConfig {
  id: number;
  title: string;
  subtitle: string;
  type: ModalType;
  buttons: Required<ModalButtons>;
  okLabel: string;
  closeLabel: string;
}

export interface ModalEvent {
  id: number;
  action: ModalAction;
}
