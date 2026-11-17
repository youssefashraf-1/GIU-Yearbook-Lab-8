import { TestBed } from '@angular/core/testing';
import { StoryDraft } from '../models/story-draft.model';
import { StoryDraftService } from './story-draft.service';

describe('StoryDraftService', () => {
  const draft: StoryDraft = {
    quote: 'Build things.',
    story: 'Four years.',
    moment: 'Demo day.',
    next: 'Graduate school.',
    consent: true,
  };
  let drafts: StoryDraftService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    drafts = TestBed.inject(StoryDraftService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('saves and loads drafts by student ID', () => {
    expect(drafts.load(7)).toBeNull();

    const savedAt = drafts.save(7, draft);

    expect(savedAt).toEqual(expect.any(String));
    expect(localStorage.getItem('giu:story-draft:7')).not.toBeNull();
    expect(drafts.load(7)).toEqual({ savedAt, values: draft });
    expect(drafts.load(1)).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    localStorage.setItem('giu:story-draft:1', '{ invalid json');

    expect(drafts.load(1)).toBeNull();
  });

  it('returns null when saving exceeds the storage quota', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError');
    });

    expect(drafts.save(1, draft)).toBeNull();
  });
});
