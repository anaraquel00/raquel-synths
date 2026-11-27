import { CREATOR_DATA } from '../../data/app-data';
import { CREATOR_STUDIO_DATA } from './creator-studio.data';
import { CREATOR_EXPERIENCE_DATA } from './creator-experience.data';

import {
  CREATOR_CANONICAL,
  CREATOR_NAME,
  CREATOR_PROFILE_ID,
  CREATOR_SEO_DATA,
  createCreatorJsonLd
} from './creator-seo.data';

describe('RQS Creator Portfolio V2 contracts', () => {
  const languages = ['pt', 'en'] as const;

  for (const lang of languages) {
    describe(`Locale: ${lang}`, () => {

      it('identifies the real creator', () => {
        expect(CREATOR_DATA[lang].profile.name)
          .toBe(CREATOR_NAME);
      });

      it('preserves the approved professional positioning', () => {
        const profile = CREATOR_DATA[lang].profile;

        expect(profile.role)
          .toContain('AI Evaluation & Software QA');

        expect(profile.role)
          .not.toContain('Angular Architect');

        expect(profile.bio)
          .not.toContain('Tech Lead');
      });

      it('contains six core expertise categories', () => {
        expect(
          CREATOR_DATA[lang].skills.categories.length
        ).toBe(6);
      });

      it('exposes only the four active Studio modules', () => {
        const modules = CREATOR_STUDIO_DATA[lang].modules;

        expect(modules.map(module => module.id))
          .toEqual(['master', 'pitch', 'build', 'uplink']);

        expect(modules.map(module => module.name))
          .toEqual(['MASTER', 'PITCH', 'BUILD', 'UPLINK']);

        expect(JSON.stringify(modules).toLowerCase())
          .not.toContain('"split"');
      });

      it('points to the public Studio application', () => {
        expect(CREATOR_STUDIO_DATA[lang].url)
          .toBe('https://studio.raquelsynths.com/app');
      });

      it('contains exactly four public portfolio repositories', () => {
        const projects = CREATOR_DATA[lang].projects.list;

        expect(projects.length).toBe(4);

        expect(projects.map(project => project.link))
          .toEqual([
            'https://github.com/anaraquel00/ai-coding-evaluation-lab',
            'https://github.com/anaraquel00/angular-qa-playground',
            'https://github.com/anaraquel00/web-audio-playground',
            'https://github.com/anaraquel00/engineering-case-studies'
          ]);

        expect(projects.map(project => project.license))
          .toEqual([
            'Apache-2.0',
            'MIT',
            'MIT',
            'CC BY 4.0'
          ]);
      });

      it('excludes discontinued projects from the showcase', () => {
        const projects = JSON.stringify(
          CREATOR_DATA[lang].projects
        );

        for (const legacy of [
          'RQS DSP Studio',
          'RQS Automation Protocol',
          'AWS Broadcast Server',
          'RQS BioLink'
        ]) {
          expect(projects).not.toContain(legacy);
        }
      });

      it('preserves human-led engineering methodology', () => {
        expect(
          CREATOR_EXPERIENCE_DATA[lang].methodology.steps.length
        ).toBe(6);

        expect(
          CREATOR_EXPERIENCE_DATA[lang].methodology.title
        ).toBe('Human-led. AI-assisted. Evidence-based.');
      });

      it('contains the approved engineering and creative sections', () => {
        const experience = CREATOR_EXPERIENCE_DATA[lang];

        expect(experience.cases.items.length).toBe(5);
        expect(experience.creative.items.length).toBe(3);
        expect(experience.education.items.length).toBe(4);
        expect(experience.languages.items.length).toBe(3);

        const creative = JSON.stringify(experience.creative);

        expect(creative).toContain('Broklin');
        expect(creative).toContain('Jonah');
        expect(creative).toContain('Suno 6.0');
        expect(creative).toContain('HeyGen');
        expect(creative.toLowerCase()).not.toContain('audiobook');
      });

      it('creates consistent professional structured data', () => {
        const schema = createCreatorJsonLd(lang);
        const seo = CREATOR_SEO_DATA[lang];

        expect(schema['@type']).toBe('ProfilePage');
        expect(schema['@id']).toBe(CREATOR_PROFILE_ID);
        expect(schema['url']).toBe(CREATOR_CANONICAL);
        expect(schema['inLanguage']).toBe(seo.language);
        expect(schema['description']).toBe(seo.description);

        expect(schema['mainEntity']).toEqual(
          jasmine.objectContaining({
            '@type': 'Person',
            name: CREATOR_NAME,
            jobTitle: seo.jobTitle,
            url: CREATOR_CANONICAL
          })
        );
      });
    });
  }

  it('keeps the same module identities across both languages', () => {
    expect(
      CREATOR_STUDIO_DATA.pt.modules.map(module => module.id)
    ).toEqual(
      CREATOR_STUDIO_DATA.en.modules.map(module => module.id)
    );
  });

  it('keeps the same repository identities across both languages', () => {
    expect(
      CREATOR_DATA.pt.projects.list.map(project => project.id)
    ).toEqual(
      CREATOR_DATA.en.projects.list.map(project => project.id)
    );
  });

  it('keeps localized descriptions distinct', () => {
    expect(CREATOR_SEO_DATA.pt.description)
      .not.toBe(CREATOR_SEO_DATA.en.description);
  });
});
