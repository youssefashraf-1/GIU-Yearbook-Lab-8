import { SavedService } from './saved.service';

describe('SavedService', () => {
  let saved: SavedService;

  beforeEach(() => {
    saved = new SavedService();
  });

  it('starts with no saved students', () => {
    expect(saved.ids()).toEqual([]);
    expect(saved.count()).toBe(0);
  });

  it('saves and removes a student with successive toggles', () => {
    saved.toggle(3);
    expect(saved.isSaved(3)).toBe(true);
    expect(saved.count()).toBe(1);

    saved.toggle(3);
    expect(saved.isSaved(3)).toBe(false);
    expect(saved.count()).toBe(0);
  });

  it('toggles students independently', () => {
    saved.toggle(1);
    saved.toggle(2);
    saved.toggle(1);

    expect(saved.ids()).toEqual([2]);
    expect(saved.isSaved(1)).toBe(false);
    expect(saved.isSaved(2)).toBe(true);
  });

  it('replaces the array instead of mutating the previous value', () => {
    const previousIds = saved.ids();
    saved.toggle(1);

    expect(saved.ids()).not.toBe(previousIds);
    expect(previousIds).toEqual([]);
    expect(saved.ids()).toEqual([1]);
  });
});
