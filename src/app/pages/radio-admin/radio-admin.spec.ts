import {
  PLATFORM_ID
} from '@angular/core';

import {
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  RadioAdminComponent
} from './radio-admin';

describe(
  'RadioAdminComponent',
  () => {
    beforeEach(() => {
      TestBed
        .configureTestingModule({
          imports: [
            RadioAdminComponent
          ],

          providers: [
            provideRouter([]),
            {
              provide:
                PLATFORM_ID,
              useValue:
                'server'
            }
          ]
        });
    });

    it(
      'renders four media sessions and Phase 2 persistence controls without YouTube writes',
      () => {
        const fixture =
          TestBed.createComponent(
            RadioAdminComponent
          );

        fixture.detectChanges();

        const component =
          fixture.componentInstance;

        component
          .authenticated
          .set(true);

        fixture.detectChanges();

        const text =
          fixture
            .nativeElement
            .textContent || '';

        expect(text)
          .toContain(
            'Media Control Plane'
          );

        expect(text)
          .toContain(
            'Monthly Radio'
          );

        expect(text)
          .toContain(
            'Weekly Videos'
          );

        expect(text)
          .toContain(
            'Shorts'
          );

        expect(text)
          .toContain(
            'Special Streams'
          );

        expect(text)
          .toContain(
            'DIRECT PUBLISHING'
          );

        expect(text)
          .toContain(
            'PHASE 4 // LIVE OPERATIONS'
          );

        expect(text)
          .toContain(
            'SAVE PLAN'
          );

        expect(text)
          .toContain(
            'PUBLISHING QUEUE'
          );

        component.selectSection(
          'weekly-video'
        );

        fixture.detectChanges();

        const weeklyText =
          fixture
            .nativeElement
            .textContent || '';

        expect(weeklyText)
          .toContain(
            'Tags'
          );

        expect(text)
          .not
          .toContain(
            'CREATE YOUTUBE LIVE'
          );

        expect(text)
          .not
          .toContain(
            'UPLOAD VIDEO'
          );
      }
    );

    it(
      'renders a persisted queue item with edit and cancel actions',
      () => {
        const fixture =
          TestBed.createComponent(
            RadioAdminComponent
          );

        fixture.detectChanges();

        const component =
          fixture.componentInstance;

        component
          .authenticated
          .set(true);

        component.queue.set([
          {
            id:
              'plan-1',
            updateTime:
              '2026-11-04T17:00:00Z',
            kind:
              'weekly-video',
            status:
              'SCHEDULED',
            title:
              'RQS // Weekly Update #142',
            description:
              'Bastidores.',
            scheduledStartTime:
              '2026-11-10T18:00:00.000Z',
            visibility:
              'unlisted',
            thumbnailUrl:
              '',
            playlistId:
              '',
            setlist:
              [],
            autoStart:
              false,
            autoStop:
              false,
            dryRunStatus:
              'PASS',
            dryRunAt:
              '2026-11-04T17:00:00Z',
            revision:
              2,
            createdAt:
              '2026-11-04T16:00:00Z',
            updatedAt:
              '2026-11-04T17:00:00Z'
          }
        ]);

        fixture.detectChanges();

        const text =
          fixture
            .nativeElement
            .textContent || '';

        expect(text)
          .toContain(
            '1 PENDING'
          );

        expect(text)
          .toContain(
            'RQS // Weekly Update #142'
          );

        expect(text)
          .toContain(
            'SCHEDULED'
          );

        expect(text)
          .toContain(
            'EDIT'
          );

        expect(text)
          .toContain(
            'CANCEL'
          );
      }
    );
  }
);
