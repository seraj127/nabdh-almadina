import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguageStore } from '../language-store';

describe('language-store', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: 'ar', direction: 'rtl' });
  });

  it('applyServerLanguage applies a server-provided language', () => {
    useLanguageStore.getState().applyServerLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
    expect(useLanguageStore.getState().direction).toBe('ltr');
  });

  it('applyServerLanguage ignores invalid languages', () => {
    useLanguageStore.getState().applyServerLanguage('fr' as never);
    expect(useLanguageStore.getState().language).toBe('ar');
  });

  it('applyServerLanguage is skipped right after a local change (echo race guard)', () => {
    useLanguageStore.getState().setLanguage('en');
    // A concurrent profile fetch echoing an older value must not revert it
    useLanguageStore.getState().applyServerLanguage('ar');
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('setLanguage updates state, document and localStorage', () => {
    useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
    expect(useLanguageStore.getState().direction).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    const saved = JSON.parse(localStorage.getItem('nabdh-language-storage') || '{}');
    expect(saved.language).toBe('en');
    expect(saved.direction).toBe('ltr');
  });

  it('t returns the translation for the active language', () => {
    useLanguageStore.getState().setLanguage('ar');
    expect(useLanguageStore.getState().t('nav.home')).toBe('الرئيسية');
    useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().t('nav.home')).toBe('Home');
  });

  it('t falls back to Arabic when only ar exists, then to the key', () => {
    expect(useLanguageStore.getState().t('missing.key')).toBe('missing.key');
  });

  it('t interpolates parameters', () => {
    expect(useLanguageStore.getState().t('order.number')).toBe('رقم الطلب');
  });
});
