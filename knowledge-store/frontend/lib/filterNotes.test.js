import { describe, expect, it } from 'vitest';
import { filterNotes } from './filterNotes';

const notes = [
  { title: 'Java Mid Sem Questions', category: 'Java', uploaderUsername: 'ritik_23' },
  { title: 'Discrete Maths Unit 1', category: 'Discrete Mathematics', uploaderUsername: 'saurav_sd' },
  { title: 'DBMS Lab Manual', category: 'DBMS', uploaderUsername: 'dipti' },
  { title: 'Data Structures Notes', category: 'Data Structures', uploaderUsername: 'ritik_23' },
  { title: 'OS Previous Papers', category: 'Operating Systems', uploaderUsername: 'anurag' },
];

describe('filterNotes', () => {
  it('returns everything when no filters are set', () => {
    expect(filterNotes(notes, {})).toHaveLength(5);
  });

  it('filters by category', () => {
    const result = filterNotes(notes, { category: 'Java' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Java Mid Sem Questions');
  });

  it('filters by partial, case-insensitive uploader name', () => {
    const result = filterNotes(notes, { personName: 'RIT' });
    expect(result).toHaveLength(2);
    expect(result.map((n) => n.title)).toEqual([
      'Java Mid Sem Questions',
      'Data Structures Notes',
    ]);
  });

  it('combines category and name filters with AND, not OR', () => {
    // Saurav's note is Discrete Mathematics, not Java — this must return nothing
    const result = filterNotes(notes, { category: 'Java', personName: 'saurav' });
    expect(result).toHaveLength(0);
  });

  it('is safe against notes missing uploaderUsername', () => {
    const broken = [{ title: 'No uploader field', category: 'Java' }];
    expect(() => filterNotes(broken, { personName: 'anything' })).not.toThrow();
    expect(filterNotes(broken, { personName: 'anything' })).toHaveLength(0);
  });
});
