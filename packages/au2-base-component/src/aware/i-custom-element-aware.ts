import { IDisposable } from 'aurelia';

export interface ICustomElementAware {
  eventName?: string;
  $awareToken?: IDisposable;
}
