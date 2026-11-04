import {
  buildYoutubeVideoResource
} from './youtube-operations.service';

describe('YouTube publish policy', () => {
  it(
    'applies RQS defaults and maps a future public slot to scheduled publishing',
    () => {
      const resource =
        buildYoutubeVideoResource(
          {
            id: 'plan-1',
            updateTime: null,
            kind: 'weekly-video',
            dryRunStatus: 'PASS',
            title: 'RQS // Test',
            description:
              'Synthetic music test.',
            scheduledStartTime:
              '2099-11-10T18:00:00.000Z',
            visibility: 'public',
            playlistId: ''
          },
          Date.parse(
            '2099-01-01T00:00:00.000Z'
          )
        ) as {
          snippet: {
            categoryId: string;
            defaultLanguage: string;
          };
          status: {
            privacyStatus: string;
            publishAt: string;
            selfDeclaredMadeForKids: boolean;
            containsSyntheticMedia: boolean;
            embeddable: boolean;
            license: string;
          };
        };

      expect(
        resource.status.privacyStatus
      ).toBe('private');

      expect(
        resource.status.publishAt
      ).toBe(
        '2099-11-10T18:00:00.000Z'
      );

      expect(
        resource.status.selfDeclaredMadeForKids
      ).toBeFalse();

      expect(
        resource.status.containsSyntheticMedia
      ).toBeTrue();

      expect(
        resource.snippet.categoryId
      ).toBe('10');

      expect(
        resource.snippet.defaultLanguage
      ).toBe('pt-BR');

      expect(
        resource.status.embeddable
      ).toBeTrue();

      expect(
        resource.status.license
      ).toBe('youtube');
    }
  );

  it(
    'keeps unlisted uploads unlisted instead of scheduling them public',
    () => {
      const resource =
        buildYoutubeVideoResource(
          {
            id: 'plan-2',
            updateTime: null,
            kind: 'short',
            dryRunStatus: 'PASS',
            title: 'RQS Short',
            description: 'Synthetic short.',
            scheduledStartTime:
              '2099-11-10T18:00:00.000Z',
            visibility: 'unlisted',
            playlistId: ''
          },
          Date.parse(
            '2099-01-01T00:00:00.000Z'
          )
        ) as {
          status: {
            privacyStatus: string;
            publishAt?: string;
          };
        };

      expect(
        resource.status.privacyStatus
      ).toBe('unlisted');

      expect(
        resource.status.publishAt
      ).toBeUndefined();
    }
  );
});
