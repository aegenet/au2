/**
 * Default capture
 */
export function defaultCapture(attr: string): boolean {
  return attr !== 'view-model' && attr !== 'component' && attr !== 'ref';
}
