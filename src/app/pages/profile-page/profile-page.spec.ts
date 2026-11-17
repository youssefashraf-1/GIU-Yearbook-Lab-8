import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { User } from '../../models/auth.model';
import { StoredStoryDraft } from '../../models/story-draft.model';
import { Student } from '../../models/student.model';
import { AuthService } from '../../services/auth.service';
import { StoryDraftService } from '../../services/story-draft.service';
import { StudentService } from '../../services/student.service';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  const maya: Student = {
    id: 1,
    name: 'Maya Hassan',
    faculty: 'Engineering',
    classYear: 2028,
    quote: 'Build things that make a difference.',
    photo: 'maya.jpg',
    featured: true,
  };
  const auth = {
    currentUser: signal<User>({ studentId: maya.id, name: maya.name, email: 'maya@example.test' }),
    logout: vi.fn(),
  };
  const students = { getStudents: vi.fn(() => of([maya])) };
  const savedAt = '2026-11-12T14:32:05.000Z';
  const savedDraft: StoredStoryDraft = {
    savedAt,
    values: {
      quote: 'My draft quote',
      story: 'My first year at GIU.',
      moment: 'Demo day',
      next: 'Graduate school',
      consent: true,
    },
  };
  const drafts = {
    load: vi.fn<StoryDraftService['load']>(),
    save: vi.fn<StoryDraftService['save']>(),
  };
  let fixture: ComponentFixture<ProfilePage>;
  let element: HTMLElement;

  beforeEach(() => {
    students.getStudents.mockClear();
    drafts.load.mockReset().mockReturnValue(null);
    drafts.save.mockReset().mockReturnValue(savedAt);
    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: StudentService, useValue: students },
        { provide: StoryDraftService, useValue: drafts },
      ],
    });
  });

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(ProfilePage);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function quoteInput(): HTMLInputElement {
    return element.querySelector<HTMLInputElement>('#quote')!;
  }

  function status(): string | null | undefined {
    return element.querySelector('.actions__status')?.textContent;
  }

  async function clickSaveDraft(): Promise<void> {
    element.querySelector<HTMLButtonElement>('.actions__buttons .btn')!.click();
    await fixture.whenStable();
  }

  it('fills in the directory quote when the signed-in student has no draft', async () => {
    await render();

    expect(drafts.load).toHaveBeenCalledExactlyOnceWith(maya.id);
    expect(quoteInput().value).toBe(maya.quote);
    expect(status()).toContain('No changes yet');
  });

  it('restores the saved draft fields, including the draft quote', async () => {
    drafts.load.mockReturnValue(savedDraft);
    await render();

    expect(quoteInput().value).toBe(savedDraft.values.quote);
    expect(element.querySelector<HTMLTextAreaElement>('#story')?.value).toBe(
      savedDraft.values.story,
    );
    expect(element.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true);
    expect(status()).toContain('Draft saved');
  });

  it('marks edits as unsaved and submits the edited form to the draft service', async () => {
    await render();
    const quote = quoteInput();
    quote.value = 'A new quote';
    quote.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(status()).toContain('Unsaved changes');
    await clickSaveDraft();

    expect(drafts.save).toHaveBeenCalledExactlyOnceWith(maya.id, {
      quote: 'A new quote',
      story: '',
      moment: '',
      next: '',
      consent: false,
    });
    expect(status()).toContain('Draft saved');
  });

  it('shows a storage error when the draft service cannot save', async () => {
    drafts.save.mockReturnValue(null);
    await render();
    await clickSaveDraft();

    expect(status()).toContain('Could not save');
  });
});
